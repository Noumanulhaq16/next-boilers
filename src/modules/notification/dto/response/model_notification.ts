import { ApiProperty } from '@nestjs/swagger';
import {
    NotificationModelEntityType,
    NotificationReadStatus,
    NotificationType,
} from '@prisma/client';

export class NotificationModel {
    @ApiProperty()
    readStatus: NotificationReadStatus;

    @ApiProperty()
    initiatorId: number;

    @ApiProperty()
    entityId: number;

    @ApiProperty({ enum: NotificationModelEntityType })
    entityType: NotificationModelEntityType;

    @ApiProperty({ enum: NotificationType })
    type: NotificationType;

    @ApiProperty()
    title: string;

    @ApiProperty()
    description: string;

    @ApiProperty()
    meta: any;
}
