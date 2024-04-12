import { IsOptional, IsString, Length } from 'class-validator';

export class CreateNoteDTO {
  @IsOptional()
  @IsString()
  @Length(0, 50)
  readonly title?: string;

  @IsOptional()
  @IsString()
  @Length(0, 1000)
  readonly content?: string;
}
