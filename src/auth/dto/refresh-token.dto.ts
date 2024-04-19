import { IsJWT, IsNotEmpty } from 'class-validator';

export class RefreshTokenDTO {
  @IsNotEmpty()
  @IsJWT()
  readonly refreshToken: string;
}
