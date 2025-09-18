import { ApiProperty } from '@nestjs/swagger';
import { NotificationModel } from './model_notification';

export class FindNotificationResponseDTO {
    @ApiProperty({ isArray: true, type: NotificationModel })
    data: NotificationModel[];

    @ApiProperty()
    count: number;
}
