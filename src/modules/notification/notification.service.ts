import { Injectable } from '@nestjs/common';
import {
    NotificationModelEntityType,
    NotificationReadStatus,
    NotificationType,
    Prisma,
    User,
    UserType
} from '@prisma/client';
import { NotFoundException } from 'core/exceptions/response.exception';
import { BooleanResponseDTO, NumberResponseDTO } from 'core/response/response.schema';
import DatabaseService from 'database/database.service';
import { SendNotifications } from 'helpers/notification.helper';
import { GetOrderOptions, GetPaginationOptions } from 'helpers/util.helper';
import { SQSSendNotificationArgs } from 'modules/queue/types';
import { FindNotificationsRequestDTO } from './dto/request/find_notification.request';
import { ReadNotificationsRequestDTO } from './dto/request/read_notifications.request';
import { FindNotificationResponseDTO } from './dto/response/find_notification.response';
import { UnreadNotificationsCountResponseDTO } from './dto/response/unread_notifications_count.response';
import { ExceptionMessage } from '../../constants';

export type NotificationData<T = void> = SQSSendNotificationArgs<T> & {
    title?: string;
    description?: string;
    entityId: number;
    entityType: NotificationModelEntityType;
    readStatus: NotificationReadStatus;
    unreadCount?: number;
};

@Injectable()
export default class NotificationService {
    constructor(private _dbService: DatabaseService) {}

    async Find(
        data: FindNotificationsRequestDTO,
        user: User
    ): Promise<FindNotificationResponseDTO> {
        const whereParams: Prisma.UsersNotificationsWhereInput = {
            receiverId: user.id,
            notification: {
                type: {
                    not: 'NEW_MESSAGE'
                }
            },
            ...(data.readStatus && { readStatus: data.readStatus })
        };
        const pagination = GetPaginationOptions(data);
        const order = GetOrderOptions(data);
        const notifications = await this._dbService.usersNotifications.findMany({
            where: {
                ...whereParams
            },
            ...pagination,
            orderBy: order,
            select: {
                notification: true,
                readStatus: true
            }
        });
        const count = await this._dbService.usersNotifications.count({
            where: {
                ...whereParams
            }
        });
        const notificationsResponse = notifications.map((item) => ({
            ...item.notification,
            readStatus: item.readStatus
        }));
        return {
            data: notificationsResponse,
            count
        };
    }

    async ReadNotifications(
        data: ReadNotificationsRequestDTO,
        user: User
    ): Promise<NumberResponseDTO> {
        // const whereParamsUpdateUserNotifications: Prisma.UsersNotificationsUpdateManyArgs = {
        //     data: { readStatus: NotificationReadStatus.READ },
        //     where: {}
        // };

        // if (data.type) {
        //     whereParamsUpdateUserNotifications.where = {
        //         notification: {
        //             entityType: data.type
        //         },
        //         receiverId: user.id
        //     };
        //     await this._dbService.usersNotifications.updateMany(whereParamsUpdateUserNotifications);
        // } else if (data.notificationIds) {
        //     const notificationsCount = await this._dbService.usersNotifications.count({
        //         where: {
        //             receiverId: user.id
        //             // notificationId: {
        //             //     in: data.notificationIds
        //             // }
        //         }
        //     });
        //     if (notificationsCount !== data.notificationIds?.length) {
        //         throw new NotFoundException(ExceptionMessage.notification.notFound);
        //     }

        //     whereParamsUpdateUserNotifications.where = {
        //         notificationId: {
        //             in: data.notificationIds
        //         }
        //     };
        //     await this._dbService.usersNotifications.updateMany(whereParamsUpdateUserNotifications);
        // }

        await this._dbService.usersNotifications.updateMany({
            where: {
                notification: {
                    type: 'USER_INTERACTION'
                },
                receiverId: user.id
            },
            data: {
                readStatus: 'READ'
            }
        });
        const unreadCount = await this._dbService.usersNotifications.count({
            where: {
                receiverId: user.id,
                readStatus: NotificationReadStatus.UNREAD
            }
        });

        return { data: unreadCount };
    }

    async GetUnreadNotificationsCount(user: User): Promise<UnreadNotificationsCountResponseDTO> {
        const unReadNotificationCount = await this._dbService.usersNotifications.count({
            where: {
                receiverId: user.id,
                readStatus: NotificationReadStatus.UNREAD
            }
        });

        return { total: unReadNotificationCount };
    }

    async ProcessNotification(data: NotificationData) {
        const { type } = data;
        switch (type) {
            case NotificationType.USER_REGISTRATION:
                return await this.ProcessUserRegistration(data);
            case NotificationType.USER_INTERACTION:
                return await this.ProcessLikeNotification(data);
            case NotificationType.NEW_MESSAGE:
                return await this.ProcessMessageNotification(data);
            default:
                return false;
        }
    }

    private async ProcessMessageNotification(data: NotificationData) {
        await this._saveNotifications(data);
        await this._sendNotificationsToDevices(data);
    }

    private async ProcessLikeNotification(data: NotificationData) {
        await this._saveNotifications(data);
        await this._sendNotificationsToDevices(data);
    }

    async constructLikeNotification(
        data: Prisma.UserInteractionGetPayload<{ include: { subjectUser: true; objectUser: true } }>
    ) {
        let likeNotificationData: any = {
            entityId: data.subjectUserId,
            entityType: data.subjectUser.type == 'ATHLETE' ? 'ATHLETE' : 'USER',
            readStatus: 'UNREAD',
            // receivers.: [data.objectUserId],
            receivers: [
                {
                    id: data.objectUserId
                }
            ],
            type: NotificationType.USER_INTERACTION,
            initiatorId: data.objectUserId,
            title: 'NEW PROFILE LIKE',
            description: `${data.subjectUser.firstName} ${data.subjectUser.lastName} liked your profile`,
            receiverType: data.objectUser.type == 'ATHLETE' ? 'ATHLETE' : 'COACH'
        };
        await this.ProcessNotification(likeNotificationData);
    }

    private async ProcessUserRegistration(data: NotificationData) {
        const notification = { ...data };

        notification.title = `New User Onboarded`;
        notification.description = ` You have a new user profile onboarded`;

        notification.entityId = data.meta?.user?.id;
        notification.entityType = NotificationModelEntityType.USER;

        await this._saveNotifications(notification);
        await this._sendNotificationsToDevices(notification);
    }

    async _sendNotificationsToDevices(notificationData: NotificationData) {
        if (!!notificationData?.receivers?.length) {
            const receiversFCMTokens = [];
            const devices = await this._dbService.device.findMany({
                where: {
                    userId: {
                        in: notificationData.receivers.map((item) => item.id)
                    },
                    user: {
                        settings: {
                            notificationsEnabled: true
                        }
                    },
                    fcmToken: {
                        not: null
                    }
                },
                select: {
                    userId: true,
                    fcmToken: true
                }
            });

            const userTokenMap: Record<number, string[]> = {};
            for (const device of devices) {
                if (!userTokenMap[device.userId]) {
                    userTokenMap[device.userId] = [];
                }
                userTokenMap[device.userId].push(device.fcmToken);
            }
            const notificationPromises = Object.entries(userTokenMap).map(
                async ([userIdStr, fcmTokens]) => {
                    const userId = Number(userIdStr);
                    const unreadCount = await this._dbService.usersNotifications.count({
                        where: {
                            receiverId: userId,
                            readStatus: 'UNREAD'
                        }
                    });

                    return SendNotifications(
                        fcmTokens,
                        notificationData.title,
                        notificationData.description,
                        {
                            type: notificationData?.type,
                            entityId: notificationData?.entityId,
                            entityType: notificationData?.entityType,
                            meta: notificationData?.meta
                        },
                        unreadCount
                    );
                }
            );

            await Promise.all(notificationPromises);

            // devices.map((user) => {
            //     receiversFCMTokens.push(user.fcmToken);
            // });

            // if (!!receiversFCMTokens.length) {
            //     SendNotifications(
            //         receiversFCMTokens,
            //         notificationData.title,
            //         notificationData.description,
            //         {
            //             type: notificationData?.type,
            //             entityId: notificationData?.entityId,
            //             entityType: notificationData?.entityType,
            //             meta: notificationData?.meta
            //         },
            //         notificationData.unreadCount
            //     );
            // }
        }
    }
    private async _saveNotifications(notificationData: NotificationData<any>) {
        if (!!notificationData?.receivers?.length) {
            await this._dbService.notification.create({
                data: {
                    initiatorId: notificationData.initiatorId,
                    entityId: notificationData.entityId,
                    entityType: notificationData.entityType,
                    title: notificationData.title,
                    description: notificationData.description,
                    type: notificationData.type,
                    ...(notificationData.meta && { meta: notificationData.meta }),
                    users: {
                        create: notificationData.receivers.map((item) => ({
                            readStatus: NotificationReadStatus.UNREAD,
                            receiverId: item.id,
                            ...(item.meta !== undefined && { meta: item.meta })
                        }))
                    }
                }
            });
        }
    }
}
