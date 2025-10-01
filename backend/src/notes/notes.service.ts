import { Injectable, Inject, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Note } from './note.entity';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { PaginationService } from '../pagination/pagination.service';
import { PaginationDto } from '../pagination/pagination.dto';
import { PaginatedResult } from '../pagination/pagination.interface';

@Injectable()
export class NotesService {
  private readonly logger = new Logger(NotesService.name);

  constructor(
    @InjectRepository(Note)
    private notesRepository: Repository<Note>,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
    private paginationService: PaginationService,
  ) {}

  async create(createNoteDto: CreateNoteDto, userId: string): Promise<Note> {
    const note = this.notesRepository.create({
      ...createNoteDto,
      userId,
    });
    
    await this.clearUserCache(userId);
    return this.notesRepository.save(note);
  }

  async getAllTags(userId: string): Promise<string[]> {
    const cacheKey = `tags:${userId}`;
    
    const cached = await this.cacheManager.get<string[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const result = await this.notesRepository
      .createQueryBuilder('note')
      .select('DISTINCT unnest(note.tags)', 'tag')
      .where('note.userId = :userId', { userId })
      .andWhere('note.tags IS NOT NULL')
      .andWhere('array_length(note.tags, 1) > 0')
      .orderBy('tag', 'ASC')
      .getRawMany();

    const tags = result.map(row => row.tag).filter(tag => tag);
    
    await this.cacheManager.set(cacheKey, tags, 300);
    return tags;
  }

  async findAll(
    userId: string, 
    paginationDto: PaginationDto, 
    tags?: string[],
    search?: string,
    sortBy?: string,
    sortOrder?: string
  ): Promise<PaginatedResult<Note>> {
    this.logger.debug(`findAll called with userId: ${userId}, pagination: ${JSON.stringify(paginationDto)}, tags: ${JSON.stringify(tags)}, search: ${search}, sortBy: ${sortBy}, sortOrder: ${sortOrder}`);
    
    const cacheKey = `notes:${userId}:${tags ? tags.join(',') : 'all'}:${search || 'nosearch'}:${sortBy || 'createdAt'}:${sortOrder || 'DESC'}:${paginationDto.cursor || 'start'}:${paginationDto.limit}`;
    this.logger.debug(`Cache key: ${cacheKey}`);
    
    const cached = await this.cacheManager.get<PaginatedResult<Note>>(cacheKey);
    if (cached) {
      this.logger.debug('Returning cached result');
      return cached;
    }

    const query = this.notesRepository
      .createQueryBuilder('note')
      .where('note.userId = :userId', { userId });

    if (tags && tags.length > 0) {
      query.andWhere('note.tags && ARRAY[:...tags]', { tags });
      this.logger.debug(`Added tags filter: ${JSON.stringify(tags)}`);
    }

    if (search) {
      query.andWhere(
        '(note.title ILIKE :search OR note.content ILIKE :search)',
        { search: `%${search}%` }
      );
      this.logger.debug(`Added search filter: ${search}`);
    }

    const validSortFields = ['createdAt', 'updatedAt', 'title'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const order = sortOrder?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    
    query.orderBy(`note.${sortField}`, order);
    query.addOrderBy('note.id', order);
    this.logger.debug(`Added sorting: ${sortField} ${order}`);

    this.logger.debug('Calling pagination service...');
    const result = await this.paginationService.paginate(query, paginationDto, 'note');
    this.logger.debug(`Pagination result: ${JSON.stringify({ itemsCount: result.data.length, nextCursor: result.nextCursor, prevCursor: result.prevCursor })}`);
    
    await this.cacheManager.set(cacheKey, result, 300);
    return result;
  }

  async findOne(id: string, userId: string): Promise<Note | null> {
    return this.notesRepository.findOne({
      where: { id, userId },
    });
  }

  async update(id: string, updateNoteDto: UpdateNoteDto, userId: string): Promise<Note | null> {
    const note = await this.findOne(id, userId);
    if (!note) return null;

    Object.assign(note, updateNoteDto);
    await this.clearUserCache(userId);
    return this.notesRepository.save(note);
  }

  async replace(id: string, createNoteDto: CreateNoteDto, userId: string): Promise<Note | null> {
    const note = await this.findOne(id, userId);
    if (!note) return null;

    note.title = createNoteDto.title;
    note.content = createNoteDto.content;
    note.tags = createNoteDto.tags || [];
    await this.clearUserCache(userId);
    return this.notesRepository.save(note);
  }

  async remove(id: string, userId: string): Promise<boolean> {
    const result = await this.notesRepository.delete({ id, userId });
    if (result.affected > 0) {
      await this.clearUserCache(userId);
      return true;
    }
    return false;
  }

  private async clearUserCache(userId: string): Promise<void> {    
    await this.cacheManager.del(`tags:${userId}`);
    
    const cacheKeys = [
      `notes:${userId}:all:nosearch:createdAt:DESC:start:10`,
      `notes:${userId}:all:nosearch:createdAt:ASC:start:10`,
      `notes:${userId}:all:nosearch:updatedAt:DESC:start:10`,
      `notes:${userId}:all:nosearch:updatedAt:ASC:start:10`,
      `notes:${userId}:all:nosearch:title:DESC:start:10`,
      `notes:${userId}:all:nosearch:title:ASC:start:10`,
    ];
    
    await Promise.all(cacheKeys.map(key => this.cacheManager.del(key)));
  }
}