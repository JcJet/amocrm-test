import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsEmail, IsString } from '@nestjs/class-validator';

export class ClientDto {
  @ApiProperty()
  @IsDefined()
  @IsString()
  readonly name: string;

  @ApiProperty()
  @IsDefined()
  @IsEmail()
  readonly email: string;

  @ApiProperty()
  @IsDefined()
  @IsString()
  readonly phone: string;
}
