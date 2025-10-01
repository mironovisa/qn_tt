import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Pagination, PaginationDto } from '../pagination/pagination.decorator';
import { CrudThrottle, ReadThrottle } from '../common/decorators/throttle.decorator';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBody, 
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
  ApiQuery,
  ApiParam
} from '@nestjs/swagger';

@ApiTags('Notes')
@ApiBearerAuth('JWT-auth')
@Controller('notes')
@UseGuards(JwtAuthGuard)
export class NotesController {
  private readonly logger = new Logger(NotesController.name);
  
  constructor(private readonly notesService: NotesService) {}

  @Post()
  @CrudThrottle()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Create a new note',
    description: 'Creates a new note for the authenticated user. The note will be associated with the user ID from the JWT token.'
  })
  @ApiBody({
    type: CreateNoteDto,
    description: 'Note data to create',
    examples: {
      example1: {
        summary: 'Simple note',
        value: {
          title: 'My First Note',
          content: 'This is the content of my note'
        }
      },
      example2: {
        summary: 'Note with tags',
        value: {
          title: 'Shopping List',
          content: 'Buy milk, eggs, and bread',
          tags: ['shopping', 'groceries']
        }
      }
    }
  })
  @ApiCreatedResponse({
    description: 'Note created successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'uuid-here' },
        title: { type: 'string', example: 'My First Note' },
        content: { type: 'string', example: 'This is the content of my note' },
        tags: { type: 'array', items: { type: 'string' }, example: ['personal'] },
        userId: { type: 'string', example: 'user-uuid-here' },
        createdAt: { type: 'string', example: '2025-10-01T09:00:00.000Z' },
        updatedAt: { type: 'string', example: '2025-10-01T09:00:00.000Z' }
      }
    }
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid or missing JWT token'
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data'
  })
  @ApiResponse({
    status: 429,
    description: 'Too many requests - rate limit exceeded (20 requests per minute)'
  })
  create(@Body() createNoteDto: CreateNoteDto, @Request() req) {
    return this.notesService.create(createNoteDto, req.user.userId);
  }

  @Get('test')
  @ReadThrottle()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Test endpoint',
    description: 'Simple test endpoint to verify API connectivity and authentication'
  })
  @ApiResponse({
    status: 200,
    description: 'Test successful',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Test successful' },
        timestamp: { type: 'string', example: '2025-10-01T09:00:00.000Z' }
      }
    }
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid or missing JWT token'
  })
  testEndpoint() {
    this.logger.debug('Test endpoint called');
    return { message: 'Test successful', timestamp: new Date() };
  }

  @Get()
  @ReadThrottle()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Get all notes with pagination',
    description: 'Retrieves paginated list of notes for the authenticated user. Supports cursor-based pagination, tag filtering, and search.'
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of notes to return (max 100)',
    example: 10
  })
  @ApiQuery({
    name: 'cursor',
    required: false,
    type: String,
    description: 'Cursor for pagination (from previous response)',
    example: 'eyJpZCI6InV1aWQtaGVyZSJ9'
  })
  @ApiQuery({
    name: 'tags',
    required: false,
    type: String,
    description: 'Comma-separated list of tags to filter by',
    example: 'work,important'
  })
  @ApiResponse({
    status: 200,
    description: 'Notes retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              title: { type: 'string' },
              content: { type: 'string' },
              tags: { type: 'array', items: { type: 'string' } },
              createdAt: { type: 'string' },
              updatedAt: { type: 'string' }
            }
          }
        },
        pagination: {
          type: 'object',
          properties: {
            nextCursor: { type: 'string', nullable: true },
            prevCursor: { type: 'string', nullable: true },
            limit: { type: 'number' },
            total: { type: 'number' }
          }
        }
      }
    }
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid or missing JWT token'
  })
  findAll(
    @Request() req,
    @Pagination() paginationDto: PaginationDto,
    @Query('tags') tagsQuery?: string,
  ) {
    this.logger.debug(`findAll called with pagination: ${JSON.stringify(paginationDto)}, tags: ${tagsQuery}`);
    
    const tags = tagsQuery ? tagsQuery.split(',') : undefined;
    this.logger.debug(`Parsed tags: ${JSON.stringify(tags)}`);
    
    return this.notesService.findAll(req.user.userId, paginationDto, tags);
  }

  @Get(':id')
  @ReadThrottle()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Get a specific note by ID',
    description: 'Retrieves a single note by its ID. Only returns notes owned by the authenticated user.'
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'Note ID (UUID)',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479'
  })
  @ApiResponse({
    status: 200,
    description: 'Note found and returned',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' },
        title: { type: 'string', example: 'My Note' },
        content: { type: 'string', example: 'Note content here' },
        tags: { type: 'array', items: { type: 'string' }, example: ['work', 'important'] },
        userId: { type: 'string', example: 'user-uuid-here' },
        createdAt: { type: 'string', example: '2025-10-01T09:00:00.000Z' },
        updatedAt: { type: 'string', example: '2025-10-01T09:00:00.000Z' }
      }
    }
  })
  @ApiNotFoundResponse({
    description: 'Note not found or not owned by user',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'Note not found' }
      }
    }
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid or missing JWT token'
  })
  async findOne(@Param('id') id: string, @Request() req) {
    const note = await this.notesService.findOne(id, req.user.userId);
    if (!note) {
      throw new NotFoundException('Note not found');
    }
    return note;
  }

  @Patch(':id')
  @CrudThrottle()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Update a note',
    description: 'Updates an existing note by ID. Only allows updating notes owned by the authenticated user.'
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'Note ID (UUID)',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479'
  })
  @ApiBody({
    type: UpdateNoteDto,
    description: 'Note data to update (all fields optional)',
    examples: {
      example1: {
        summary: 'Update title only',
        value: {
          title: 'Updated Note Title'
        }
      },
      example2: {
        summary: 'Update multiple fields',
        value: {
          title: 'Updated Title',
          content: 'Updated content',
          tags: ['updated', 'modified']
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Note updated successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' },
        title: { type: 'string', example: 'Updated Note Title' },
        content: { type: 'string', example: 'Updated content' },
        tags: { type: 'array', items: { type: 'string' }, example: ['updated', 'modified'] },
        userId: { type: 'string', example: 'user-uuid-here' },
        createdAt: { type: 'string', example: '2025-10-01T09:00:00.000Z' },
        updatedAt: { type: 'string', example: '2025-10-01T09:15:00.000Z' }
      }
    }
  })
  @ApiNotFoundResponse({
    description: 'Note not found or not owned by user'
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid or missing JWT token'
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data'
  })
  @ApiResponse({
    status: 429,
    description: 'Too many requests - rate limit exceeded (20 requests per minute)'
  })
  async update(
    @Param('id') id: string,
    @Body() updateNoteDto: UpdateNoteDto,
    @Request() req,
  ) {
    const note = await this.notesService.update(id, updateNoteDto, req.user.userId);
    if (!note) {
      throw new NotFoundException('Note not found');
    }
    return note;
  }

  @Delete(':id')
  @CrudThrottle()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Delete a note',
    description: 'Permanently deletes a note by ID. Only allows deleting notes owned by the authenticated user.'
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'Note ID (UUID)',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479'
  })
  @ApiResponse({
    status: 200,
    description: 'Note deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Note deleted successfully' }
      }
    }
  })
  @ApiNotFoundResponse({
    description: 'Note not found or not owned by user',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'Note not found' }
      }
    }
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid or missing JWT token'
  })
  @ApiResponse({
    status: 429,
    description: 'Too many requests - rate limit exceeded (20 requests per minute)'
  })
  async remove(@Param('id') id: string, @Request() req) {
    const deleted = await this.notesService.remove(id, req.user.userId);
    if (!deleted) {
      throw new NotFoundException('Note not found');
    }
    return { message: 'Note deleted successfully' };
  }
}