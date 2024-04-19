import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDTO } from './create-user.dto';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
  Length,
} from 'class-validator';

export class UpdateUserDTO extends PartialType(CreateUserDTO) {
  readonly name?: string;

  @IsNotEmpty()
  @IsString()
  @IsOptional()
  readonly oldPassword?: string;

  @IsNotEmpty()
  @IsString()
  @IsStrongPassword()
  @Length(8, 64)
  @IsOptional()
  readonly newPassword?: string;
}
