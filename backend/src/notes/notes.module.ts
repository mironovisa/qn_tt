import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { NotesController } from './notes.controller';
import { NotesService } from './notes.service';
import { Note } from './note.entity';
import { PaginationModule } from '../pagination/pagination.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Note]),
    CacheModule.register({
      ttl: 300, 
      max: 100, 
    }),
    PaginationModule,
  ],
  controllers: [NotesController],
  providers: [NotesService],
  exports: [NotesService],
})
export class NotesModule {}