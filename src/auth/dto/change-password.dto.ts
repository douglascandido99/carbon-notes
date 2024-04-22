import { PartialType } from '@nestjs/mapped-types';
import { ConfirmEmailDTO } from './confirm-email.dto';
import {
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  Length,
} from 'class-validator';

export class ChangePasswordDTO extends PartialType(ConfirmEmailDTO) {
  readonly token: string;

  @IsNotEmpty()
  @IsString()
  @IsStrongPassword()
  @Length(8, 64)
  readonly password: string;
}
