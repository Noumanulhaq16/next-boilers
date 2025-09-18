import { Body, Query } from '@nestjs/common';
import { User } from '@prisma/client';
import { ApiController, Authorized, CurrentUser, Get, Post } from 'core/decorators';
import { BooleanResponseDTO, NumberResponseDTO } from 'core/response/response.schema';
import { FindNotificationsRequestDTO } from './dto/request/find_notification.request';
import { ReadNotificationsRequestDTO } from './dto/request/read_notifications.request';
import { FindNotificationResponseDTO } from './dto/response/find_notification.response';
import { UnreadNotificationsCountResponseDTO } from './dto/response/unread_notifications_count.response';
import NotificationService from './notification.service';

@ApiController({ version: '1', tag: 'notifications' })
export default class NotificationController {
    constructor(private readonly _notificationService: NotificationService) {}

    @Authorized()
    @Get({
        path: '/notifications',
        description: 'Get all notifications',
        response: FindNotificationResponseDTO
    })
    Find(
        @Query() data: FindNotificationsRequestDTO,
        @CurrentUser() user: User
    ): Promise<FindNotificationResponseDTO> {
        return this._notificationService.Find(data, user);
    }

    @Authorized()
    @Post({
        path: '/notifications/read',
        description: 'Mark notifications as read',
        response: NumberResponseDTO
    })
    ReadNotifications(
        @Body() data: ReadNotificationsRequestDTO,
        @CurrentUser() user: User
    ): Promise<NumberResponseDTO> {
        return this._notificationService.ReadNotifications(data, user);
    }

    @Authorized()
    @Get({
        path: '/notifications/unread/count',
        description: 'Notifications unread count',
        response: UnreadNotificationsCountResponseDTO
    })
    GetUnreadNotificationsCount(
        @CurrentUser() user: User
    ): Promise<UnreadNotificationsCountResponseDTO> {
        return this._notificationService.GetUnreadNotificationsCount(user);
    }
}
