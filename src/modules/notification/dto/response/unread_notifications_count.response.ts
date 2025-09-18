import { ApiProperty } from '@nestjs/swagger';

export class UnreadNotificationsCountResponseDTO {
    @ApiProperty()
    total: number;
}
