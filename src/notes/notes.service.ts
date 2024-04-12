import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateNoteDTO } from './dto/create-note.dto';
import { NotesRepository } from './repository/notes-repository';
import { UpdateNoteDTO } from './dto/update-note.dto';
import { Note } from '@prisma/client';

@Injectable()
export class NotesService {
  constructor(private readonly note: NotesRepository) {}

  async createNote(noteDto: CreateNoteDTO, userId: number): Promise<Note> {
    if (!noteDto.title?.trim() && !noteDto.content?.trim()) {
      return;
    }

    const data: Partial<Note> = { ...noteDto, userId };

    try {
      return await this.note.createNote(data as Note);
    } catch (error) {
      throw new InternalServerErrorException('Failed to create note');
    }
  }

  async getNoteById(id: string, userId: number): Promise<Note> {
    const note: Note = await this.note.findNoteById(id);

    if (!note || note.userId !== userId)
      throw new NotFoundException('Note not found');

    try {
      return note;
    } catch (error) {
      throw new InternalServerErrorException('Failed to get note');
    }
  }

  async getAllNotes(userId: number): Promise<Note[]> {
    const notes: Note[] = await this.note.findAllNotesByUserId(userId);

    if (!notes || notes.length == 0) return null;

    try {
      return notes;
    } catch (error) {
      throw new InternalServerErrorException('Failed to get notes');
    }
  }

  async updateNote(
    noteDto: UpdateNoteDTO,
    id: string,
    userId: number,
  ): Promise<void> {
    const note: Note = await this.note.findNoteById(id);

    if (!note || note.userId !== userId)
      throw new NotFoundException('Note not found');

    try {
      return await this.note.updateNote(id, noteDto);
    } catch (error) {
      throw new InternalServerErrorException('Failed to update note');
    }
  }

  async deleteNote(id: string, userId: number): Promise<void> {
    const note: Note = await this.note.findNoteById(id);

    if (!note || note.userId !== userId)
      throw new NotFoundException('Note not found');

    try {
      await this.note.deleteNoteById(id);
    } catch (error) {
      throw new InternalServerErrorException('Failed to delete note');
    }
  }
}
