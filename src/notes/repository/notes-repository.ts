import { Injectable } from '@nestjs/common';
import { Note, Prisma } from '@prisma/client';
import { PrismaService } from 'src/shared/prisma/prisma.service';

@Injectable()
export class NotesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createNote(data: Prisma.NoteCreateInput): Promise<Note> {
    return await this.prisma.note.create({
      data,
    });
  }

  async findNoteById(id: string): Promise<Note> {
    return await this.prisma.note.findFirst({
      where: {
        id,
      },
    });
  }

  async findAllNotesByUserId(userId: number): Promise<Note[]> {
    return await this.prisma.note.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async updateNote(id: string, data: Prisma.NoteUpdateInput): Promise<void> {
    await this.prisma.note.update({
      where: {
        id,
      },
      data,
    });
  }

  async deleteNoteById(id: string): Promise<void> {
    await this.prisma.note.delete({
      where: {
        id,
      },
    });
  }
}
