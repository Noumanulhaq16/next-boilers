import { Injectable } from '@nestjs/common';
import { ChatType, Prisma, User } from '@prisma/client';
import DatabaseService from 'database/database.service';
import { FindChatEventsRequestDTO, FindChatsRequestDTO } from './dto/request/find.request';
import {
    FindChatEventsResponseDTO,
    FindChatsResponseDTO,
    UnreadCount
} from './dto/response/find.response';
import { GetOrderOptions, GetPaginationOptions } from 'helpers/util.helper';
import { ChatEventResponseModel, ChatResponseModel } from './dto/response/model';
import {
    BadRequestException,
    ForbiddenException,
    NotFoundException
} from 'core/exceptions/response.exception';
import { ExceptionMessage } from '../../../constants';
import { OrderDirection } from 'core/request/paginated.request';
import { FindChats, FindUnreadCount, TChats, TUnreadCount } from './queries';
import { BooleanResponseDTO } from 'core/response/response.schema';

@Injectable()
export default class ChatService {
    constructor(private _dbService: DatabaseService) {}

    async FindChatBetweenUsers(
        userId1: number,
        userId2: number
    ): Promise<Pick<ChatResponseModel, 'id' | 'type'>> {
        const existingChat = await this._dbService.chat.findFirst({
            where: {
                type: ChatType.INDIVIDUAL,
                participants: {
                    some: {
                        deletedAt: null,
                        userId: userId1,
                        chat: {
                            participants: { some: { userId: userId2, deletedAt: null } }
                        }
                    }
                }
            },
            select: { id: true, type: true }
        });
        return existingChat;
    }

    async CreateChat(
        chatType: ChatType,
        userIds: number[]
    ): Promise<Pick<ChatResponseModel, 'id' | 'type'>> {
        if (!userIds.length) {
            throw new BadRequestException();
        }
        if (chatType === ChatType.INDIVIDUAL && userIds?.length !== 2) {
            throw new BadRequestException();
        }
        if (chatType === ChatType.INDIVIDUAL) {
            const existingChat = await this.FindChatBetweenUsers(userIds[0], userIds[1]);
            if (existingChat) {
                throw new BadRequestException(ExceptionMessage.chat.alreadyExist);
            }
        }
        const chat = await this._dbService.chat.create({
            data: {
                type: chatType,
                participants: {
                    createMany: { data: userIds.map((userId) => ({ userId })) }
                }
            },
            select: { id: true, type: true }
        });
        return chat;
    }

    async FindChats(data: FindChatsRequestDTO, currentUser: User): Promise<FindChatsResponseDTO> {
        const chatIdsRes = await this._dbService.$queryRaw<TChats>`${FindChats(currentUser.id)}`;
        const chatIds: number[] = chatIdsRes?.map((item) => item.id);
        if (!chatIds?.length) {
            return { data: [], count: 0 };
        }

        const whereParams: Prisma.ChatWhereInput = { id: { in: chatIds } };

        const pagination = GetPaginationOptions(data);
        const order = GetOrderOptions({
            column: <keyof ChatResponseModel>'lastEventId',
            direction: OrderDirection.DESC
        });

        const chats = await this._dbService.chat.findMany({
            where: {
                ...whereParams,
                ...(data.beforeLastEventId && { lastEventId: { lt: data.beforeLastEventId } })
            },
            include: {
                participants: {
                    where: {
                        deletedAt: null,
                        chat: { type: ChatType.INDIVIDUAL }
                    },
                    include: {
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
                lastEvent: {
                    include: {
                        attachments: { where: { deletedAt: null }, select: { id: true } },
                        senderParticipant: {
                            select: {
                                id: true,
                                userId: true,
                                user: { select: { id: true, firstName: true, lastName: true } }
                            }
                        }
                    }
                }
            },
            ...pagination,
            orderBy: order
        });
        const chatsWithUnread = await Promise.all(
            chats.map(async (chat) => {
                const participant = chat.participants.find((p) => p.userId === currentUser.id);
                let unreadCount = 0;

                if (participant) {
                    unreadCount = await this._dbService.chatEvent.count({
                        where: {
                            chatId: chat.id,
                            deletedAt: null,
                            id: {
                                gt: participant.lastReadEventId ?? undefined
                            }
                        }
                    });
                }

                return {
                    ...chat,
                    unreadCount
                };
            })
        );

        const count = await this._dbService.chat.count({
            where: whereParams
        });

        return { data: chatsWithUnread, count };
    }

    async FindChatById(
        chatId: number,
        currentUserId: number,
        basic: boolean = false
    ): Promise<ChatResponseModel> {
        const chat = await this._dbService.chat.findFirst({
            where: {
                id: chatId,
                participants: { some: { deletedAt: null, userId: currentUserId } }
            },
            include: {
                participants: {
                    where: { deletedAt: null },
                    include: {
                        user: basic
                            ? false
                            : {
                                  select: {
                                      id: true,
                                      firstName: true,
                                      lastName: true,
                                      type: true,
                                      profilePicture: { select: { path: true, thumbPath: true } }
                                  }
                              }
                    }
                }
            }
        });
        if (!chat) {
            throw new NotFoundException(ExceptionMessage.chat.notFound);
        }
        return chat;
    }

    async FindChatEvents(
        chatId: number,
        data: FindChatEventsRequestDTO,
        user: User
    ): Promise<FindChatEventsResponseDTO> {
        const chat = await this._dbService.chat.findFirst({
            where: {
                id: chatId,
                participants: { some: { deletedAt: null, userId: user.id } }
            },
            select: {
                id: true,
                participants: {
                    where: { deletedAt: null, userId: user.id },
                    select: { id: true, lastDeletedEventId: true }
                }
            }
        });
        if (!chat) {
            throw new NotFoundException(ExceptionMessage.chat.notFound);
        }
        const chatParticipant = chat.participants[0];
        const whereParams: Prisma.ChatEventWhereInput = {
            chatId: chat.id
        };
        whereParams.AND = [];
        if (chatParticipant?.lastDeletedEventId) {
            whereParams.AND.push({ id: { gt: chatParticipant.lastDeletedEventId } });
        }

        const pagination = GetPaginationOptions(data);
        const order = GetOrderOptions({
            column: <keyof ChatEventResponseModel>'id',
            direction: OrderDirection.DESC
        });

        const chatEvents = await this._dbService.chatEvent.findMany({
            where: {
                ...whereParams,
                ...(data.beforeChatEventId && {
                    id: { lt: data.beforeChatEventId }
                })
            },
            include: {
                attachments: {
                    where: { deletedAt: null },
                    select: {
                        id: true,
                        eventId: true,
                        mediaId: true,
                        media: { select: { id: true, path: true, thumbPath: true, type: true } }
                    }
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
                }
            },
            ...pagination,
            orderBy: order
        });
        const count = await this._dbService.chatEvent.count({
            where: whereParams
        });

        return { data: chatEvents, count };
    }

    async DeleteChat(chatId: number, user: User): Promise<BooleanResponseDTO> {
        const chat = await this._dbService.chat.findFirst({
            where: {
                id: chatId,
                participants: { some: { deletedAt: null, userId: user.id } }
            },
            select: { id: true, lastEventId: true }
        });
        if (!chat) {
            throw new NotFoundException(ExceptionMessage.chat.notFound);
        }
        await this._dbService.chatParticipant.updateMany({
            where: { chatId: chat.id, userId: user.id },
            data: { lastDeletedEventId: chat.lastEventId }
        });
        return { data: true };
    }

    async BlockChat(chatId: number, userId: number, block: boolean): Promise<BooleanResponseDTO> {
        const chat = await this._dbService.chat.findFirst({
            where: {
                id: chatId,
                participants: { some: { deletedAt: null, userId: userId } }
            },
            select: { id: true, blockedBy: true }
        });
        if (!chat) {
            throw new NotFoundException(ExceptionMessage.chat.notFound);
        }
        if (chat.blockedBy && chat.blockedBy !== userId) {
            throw new ForbiddenException();
        }
        await this._dbService.chat.update({
            where: { id: chat.id },
            data: { blockedBy: block ? userId : null }
        });
        return { data: true };
    }

    async UnreadCount(currentUser: User): Promise<UnreadCount> {
        const [result] = await this._dbService.$queryRaw<TUnreadCount[]>`${FindUnreadCount(
            currentUser.id
        )}`;
        const unreadCount = result?.unreadCount ?? 0;
        return { count: Number(unreadCount) };
    }
}
