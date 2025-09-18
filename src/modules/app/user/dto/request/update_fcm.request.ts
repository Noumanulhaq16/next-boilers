import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';

export class UpdateFCMTokenRequestDTO {
    @ApiProperty()
    @IsString()
    fcmToken: string;
}
