import { IsNotEmpty, IsString } from 'class-validator';

export class ConfirmEmailDTO {
  @IsString()
  @IsNotEmpty()
  readonly token: string;
}
