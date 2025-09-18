import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional } from 'class-validator';

export class LeaveRoomDto {
    @ApiProperty()
    @IsInt()
    roomId: number;
}
