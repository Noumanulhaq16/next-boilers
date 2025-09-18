import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, Length } from 'class-validator';

export class ChangePasswordRequestDTO {
    @ApiProperty()
    @Length(1, 255)
    oldPassword: string;

    @ApiProperty()
    @Length(6, 128)
    newPassword: string;
}
