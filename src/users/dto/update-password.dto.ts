import {
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  Length,
} from 'class-validator';

export class UpdatePasswordDTO {
  @IsNotEmpty()
  @IsString()
  readonly oldPassword: string;

  @IsNotEmpty()
  @IsString()
  @IsStrongPassword()
  @Length(8, 64)
  readonly newPassword: string;
}
