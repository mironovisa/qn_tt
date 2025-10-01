import { IsString, IsNotEmpty, IsArray, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateNoteDto {
  @ApiProperty({
    description: 'Note title',
    example: 'My Important Note',
    minLength: 1
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Note content',
    example: 'This is the detailed content of my note with important information.',
    minLength: 1
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    description: 'Array of tags to categorize the note',
    example: ['work', 'important', 'project'],
    required: false,
    type: [String]
  })
  @IsArray()
  @IsOptional()
  tags?: string[];
}