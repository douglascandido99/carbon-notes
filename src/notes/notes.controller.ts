import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { NotesService } from './notes.service';
import { CreateNoteDTO } from './dto/create-note.dto';
import { GetUser } from 'src/auth/decorators/get-user-decorator';
import { UpdateNoteDTO } from './dto/update-note.dto';
import { JwtAuthGuard } from 'src/auth/jwt/guards/jwt-auth-guard';
import { Note } from '@prisma/client';

@UseGuards(JwtAuthGuard)
@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Post('create')
  async createNote(
    @Body() noteDto: CreateNoteDTO,
    @GetUser('id', ParseIntPipe) userId: number,
  ): Promise<Note> {
    return await this.notesService.createNote(noteDto, userId);
  }

  @Get(':id')
  async getNoteById(
    @Param('id') id: string,
    @GetUser('id', ParseIntPipe) userId: number,
  ): Promise<Note> {
    return await this.notesService.getNoteById(id, userId);
  }

  @Get()
  async getAllNotes(@GetUser('id') userId: number): Promise<Note[]> {
    return await this.notesService.getAllNotes(userId);
  }

  @Patch(':id')
  async updateNote(
    @Body() noteDto: UpdateNoteDTO,
    @Param('id') id: string,
    @GetUser('id', ParseIntPipe) userId: number,
  ): Promise<void> {
    return await this.notesService.updateNote(noteDto, id, userId);
  }

  @Delete(':id')
  async deleteNote(
    @Param('id') id: string,
    @GetUser('id', ParseIntPipe) userId: number,
  ): Promise<void> {
    return await this.notesService.deleteNote(id, userId);
  }
}
