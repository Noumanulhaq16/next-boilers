import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class ReadMessageSocketEventDTO {
    @ApiProperty()
    @IsInt()
    chatId: number;

    @ApiProperty()
    @IsInt()
    chatEventId: number;
}
