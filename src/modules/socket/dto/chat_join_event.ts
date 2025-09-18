import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class ChatJoinSocketEventDTO {
    @ApiProperty()
    @IsInt()
    userId: number;
}
