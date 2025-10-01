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

  async findAll(
    userId: string, 
    paginationDto: PaginationDto, 
    tags?: string[]
  ): Promise<PaginatedResult<Note>> {
    this.logger.debug(`findAll called with userId: ${userId}, pagination: ${JSON.stringify(paginationDto)}, tags: ${JSON.stringify(tags)}`);
    
    const cacheKey = `notes:${userId}:${tags ? tags.join(',') : 'all'}:${paginationDto.cursor || 'start'}:${paginationDto.limit}`;
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

  async remove(id: string, userId: string): Promise<boolean> {
    const result = await this.notesRepository.delete({ id, userId });
    if (result.affected > 0) {
      await this.clearUserCache(userId);
      return true;
    }
    return false;
  }

  private async clearUserCache(userId: string): Promise<void> {    
    const keysToDelete = [
      `notes:${userId}:all:start:10`,
      `notes:${userId}:all:start:20`,
      `notes:${userId}:all:start:50`,
    ];
    
    await Promise.all(keysToDelete.map(key => this.cacheManager.del(key)));
  }
}