import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import DatabaseService from 'database/database.service';
import {
    BadRequestWsException,
    FatalErrorWsException,
    ForbiddenWsException,
    NotFoundWsException,
    UnAuthorizedWsException
} from 'core/exceptions/response.exception';
import { ExceptionMessage } from '../../constants';
import ConnectedSocketEvent from './events/connected.event';
import AuthService from 'modules/app/auth/auth.service';
import { ChatType, MediaStatus, MediaType, NotificationType, UserStatus } from '@prisma/client';
import SocketHelper from './socket.helper';
import DisconnectedSocketEvent from './events/disconnected.event';
import ChatJoinSocketEvent from './events/chat_join.event';
import ChatService from 'modules/app/chat/chat.service';
import { ChatResponseModel } from 'modules/app/chat/dto/response/model';
import MessageSocketEvent from './events/message.event';
import { WsException } from '@nestjs/websockets';
import ReadMessageSocketEvent from './events/read_message.event';
import OnlineSocketEvent from './events/online.event';
import { Now } from 'helpers/date.helper';
import LeaveEventRoom from './events/leave_room_event';
import NotificationService, { NotificationData } from 'modules/notification/notification.service';
import ChatListEvent from './events/chat_list.event';

@Injectable()
export default class SocketEventHandler {
    constructor(
        private _dbService: DatabaseService,
        private _authService: AuthService,
        private _socketHelper: SocketHelper,
        private _chatService: ChatService,
        private _notificationService: NotificationService
    ) {}

    HandleEventException(err) {
        const errResponse = err?.response;
        const errStatus = err?.status;
        if (err instanceof HttpException) {
            return new WsException({ ...errResponse, status: errStatus });
        }
        if (!(err instanceof WsException)) {
            return new WsException(err);
        }
        return err;
    }

    async SocketAuthentication(socket: Socket, next: Function) {
        const token: string = socket.handshake.query.authorization as string;
        const actorId: number = parseInt(socket.handshake.query.actorId as string);
        if (token) {
            let auth = await this._authService.GetSession(token);
            if (auth && auth.Id === actorId) {
                // socket.data.userId = actorId;
                return next();
            }
        }
        const error: any = new Error();
        error.status = HttpStatus.UNAUTHORIZED;
        error.message = 'Not Authorized';
        return next(error);
    }

    async OnConnectedEvent(event: ConnectedSocketEvent) {
        const userId: number = parseInt(event.GetSocket().handshake.query.actorId as string);
        let user = await this._dbService.user.findFirst({
            where: { id: userId, status: UserStatus.ACTIVE },
            select: { id: true }
        });
        if (!user) {
            throw new NotFoundWsException(ExceptionMessage.user.notFound);
        }
        await this._socketHelper.AddUserSocket(event.GetSocket().id, user.id);

        const chats = await this._dbService.chat.findMany({
            where: { participants: { some: { deletedAt: null, userId: user.id } } },
            select: { id: true }
        });
        const chatIds = chats.map((chat) => chat.id);
        if (chatIds?.length) {
            event.JoinChatRooms(chatIds);
        }
        await this._dbService.user.update({ where: { id: user.id }, data: { isOnline: true } });
        const onlineEvent = new OnlineSocketEvent(
            event.GetSocket(),
            { userId: user.id, isOnline: true },
            event.GetIO()
        );
        event.JoinChatList(userId);
        onlineEvent.BroadcastToAllConnectedClients();
    }

    async OnDisconnectedEvent(event: DisconnectedSocketEvent) {
        const socketData = await this._socketHelper.GetSocketDataById(event.GetSocket().id);
        await this._socketHelper.RemoveUserSocket(socketData.socketId, socketData.userId);
        const socketIds = await this._socketHelper.GetSocketIdsByUserId(socketData.userId);
        if (!socketIds.length) {
            await this._dbService.user.update({
                where: { id: socketData.userId },
                data: { isOnline: false, lastSeenAt: Now() }
            });
            const onlineEvent = new OnlineSocketEvent(
                event.GetSocket(),
                { userId: socketData.userId, isOnline: false },
                event.GetIO()
            );
            onlineEvent.BroadcastToAllConnectedClients();
        }

        const usersToRoomMapping = await this._socketHelper.getUserToRoomMappings(
            socketData.userId
        );
        if (Array.isArray(usersToRoomMapping) && usersToRoomMapping.length) {
            const promises = usersToRoomMapping.map((roomId: number) => {
                return this._socketHelper.removeUserFromRoom(roomId, socketData.userId);
            });

            await Promise.all(promises);
        }
    }

    async OnChatJoinEvent(event: ChatJoinSocketEvent) {
        try {
            const socketData = await this._socketHelper.GetSocketDataById(event.GetSocket().id);
            if (socketData.userId === event.data.userId) {
                throw new BadRequestWsException();
            }
            let chat: Partial<ChatResponseModel> = new ChatResponseModel();
            chat = await this._chatService.FindChatBetweenUsers(
                socketData.userId,
                event.data.userId
            );
            if (!chat) {
                const newChat = await this._chatService.CreateChat(ChatType.INDIVIDUAL, [
                    socketData.userId,
                    event.data.userId
                ]);
                chat = newChat;
            }

            const fullChat = await this._dbService.chat.findUnique({
                where: { id: chat.id },

                select: { lastEventId: true }
            });

            const participant = await this._dbService.chatParticipant.findFirst({
                where: {
                    chatId: chat.id,
                    userId: socketData.userId
                }
            });

            await this._dbService.chatParticipant.update({
                where: {
                    id: participant.id
                },
                data: {
                    lastReadEventId: fullChat?.lastEventId || null,
                    lastDeliveredEventId: fullChat?.lastEventId || null
                }
            });

            await this._dbService.$executeRawUnsafe(
                `
                UPDATE "UsersNotifications"
                SET "readStatus" = 'READ'
                FROM "Notification"
                WHERE "UsersNotifications"."receiverId" = $1
                AND ("UsersNotifications".meta->>'roomId')::int = $2
                AND "UsersNotifications"."deletedAt" IS NULL
                AND "Notification"."id" = "UsersNotifications"."notificationId"
                AND "Notification"."type" = 'NEW_MESSAGE'
                `,
                socketData.userId,
                chat.id
            );

            const userIds = [socketData.userId, event.data.userId];
            const socketIds = await this._socketHelper.GetSocketIdsByUserIds(userIds);
            await this._socketHelper.addUserToRoom(chat.id, socketData.userId);
            await this._socketHelper.addRoomToUser(chat.id, socketData.userId);
            event.SocketIdsJoinChatRoom(socketIds, chat.id);
            return chat;
        } catch (err) {
            console.log(err, 'Err');
            return this.HandleEventException(err);
        }
    }

    async OnMessageEvent(event: MessageSocketEvent) {
        try {
            const socketData = await this._socketHelper.GetSocketDataById(event.GetSocket().id);
            const chat = await this._chatService.FindChatById(
                event.data.chatId,
                socketData.userId,
                false
            );
            if (chat.blockedBy) {
                throw new ForbiddenWsException(ExceptionMessage.user.notAllowed);
            }
            const senderParticipant = chat.participants.find(
                (participant) => participant.userId === socketData.userId
            );

            const receiverParticipant = chat.participants.find(
                (participant) => participant.userId !== socketData.userId
            );

            const isBlocked = await this._dbService.user.findFirst({
                where: {
                    id: receiverParticipant.userId,
                    isBlocked: true
                }
            });

            if (isBlocked) {
                throw new BadRequestWsException('chat.participant.blocked');
            }
            console.log('here');
            if (event.data.mediaIds?.length) {
                const mediaCount = await this._dbService.media.count({
                    where: {
                        id: { in: event.data.mediaIds },
                        userId: socketData.userId,
                        status: MediaStatus.READY,
                        type: { in: [MediaType.IMAGE] }
                    }
                });
                if (mediaCount !== event.data.mediaIds.length) {
                    throw new NotFoundWsException(ExceptionMessage.media.notFound);
                }
            }

            const chatEvent = await this._dbService.$transaction(async (tx) => {
                const newChatEvent = await tx.chatEvent.create({
                    data: {
                        chatId: chat.id,
                        senderParticipantId: senderParticipant.id,
                        ...(event.data.content && { content: event.data.content }),
                        ...(event.data.mediaIds?.length && {
                            attachments: {
                                createMany: {
                                    data: event.data.mediaIds.map((mediaId) => ({
                                        mediaId: mediaId
                                    }))
                                }
                            }
                        })
                    },
                    include: {
                        chat: {
                            select: { id: true, type: true }
                        },
                        senderParticipant: {
                            select: {
                                id: true,
                                userId: true,
                                user: {
                                    select: {
                                        id: true,
                                        firstName: true,
                                        lastName: true,
                                        profilePicture: { select: { path: true, thumbPath: true } }
                                    }
                                }
                            }
                        },
                        attachments: {
                            where: { deletedAt: null },
                            select: {
                                id: true,
                                eventId: true,
                                mediaId: true,
                                media: {
                                    select: { id: true, path: true, thumbPath: true, type: true }
                                }
                            }
                        }
                    }
                });
                await tx.chat.update({
                    where: { id: chat.id },
                    data: { lastEventId: newChatEvent.id }
                });
                await tx.chatParticipant.update({
                    where: { id: senderParticipant.id },
                    data: {
                        lastReadEventId: newChatEvent.id,
                        lastDeliveredEventId: newChatEvent.id
                    }
                });
                return newChatEvent;
            });

            event.data = chatEvent;
            event.BroadcastToChatRoom(chat.id);
            const isReceiverInRoom = await this._socketHelper.isUserInRoom(
                chat.id,
                receiverParticipant.userId
            );

            if (!isReceiverInRoom) {
                const notificationData: any = {
                    entityId: senderParticipant.userId,
                    entityType: senderParticipant.user.type == 'ATHLETE' ? 'ATHLETE' : 'USER',
                    readStatus: 'UNREAD',
                    type: NotificationType.NEW_MESSAGE,
                    receiverIds: [receiverParticipant.userId],
                    title: 'New Message',
                    description: `${senderParticipant.user.firstName} ${senderParticipant.user.lastName} Sent You A Message`,
                    initiatorId: senderParticipant.userId,
                    receiverType: receiverParticipant.user.type,
                    receivers: [
                        {
                            id: receiverParticipant.userId,
                            meta: {
                                receiverId: receiverParticipant.userId,
                                roomId: chat.id
                            }
                        }
                    ]
                };

                await this._notificationService.ProcessNotification(notificationData);
            }
            // return { id: chatEvent.id };
        } catch (err) {
            console.log(err, 'ERR');
            return this.HandleEventException(err);
        }
    }

    async OnReadMessageEvent(event: ReadMessageSocketEvent) {
        try {
            const socketData = await this._socketHelper.GetSocketDataById(event.GetSocket().id);
            const chat = await this._dbService.chat.findFirst({
                where: {
                    id: event.data.chatId,
                    participants: { some: { deletedAt: null, userId: socketData.userId } }
                },
                select: {
                    id: true,
                    participants: {
                        where: { deletedAt: null, userId: socketData.userId },
                        select: { id: true, lastReadEventId: true, lastDeliveredEventId: true }
                    }
                }
            });
            if (!chat) {
                throw new NotFoundWsException(ExceptionMessage.chat.notFound);
            }
            const chatEvent = await this._dbService.chatEvent.findFirst({
                where: { id: event.data.chatEventId, chatId: chat.id },
                select: { id: true, chatId: true }
            });
            if (!chatEvent) {
                throw new NotFoundWsException(ExceptionMessage.chat.event.notFound);
            }

            const chatParticipant = chat.participants[0];
            event.data.chatParticipantId = chatParticipant?.id;
            if (chatParticipant?.lastReadEventId < chatEvent.id) {
                await this._dbService.chatParticipant.update({
                    where: { id: chatParticipant.id },
                    data: {
                        lastReadEventId: chatEvent.id,
                        ...(chatParticipant.lastDeliveredEventId < chatEvent.id && {
                            lastDeliveredEventId: chatEvent.id
                        })
                    }
                });
                event.BroadcastToChatRoom(chat.id);
            }
        } catch (err) {
            return this.HandleEventException(err);
        }
    }

    async OnLeaveRoomEvent(event: LeaveEventRoom) {
        const sockEntity = await this._socketHelper.GetSocketDataById(event.GetSocket().id);
        await this._socketHelper.removeUserFromRoom(event.GetData().roomId, sockEntity.userId);
        await this._socketHelper.removeRoomFromUserToRoomMapping(
            event.GetData().roomId,
            sockEntity.userId
        );
    }
}
