import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDTO } from '../../users/dto/create-user.dto';

export class ResetPasswordDTO extends PartialType(CreateUserDTO) {
  readonly email: string;
}
