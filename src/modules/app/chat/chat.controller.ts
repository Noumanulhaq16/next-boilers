import { Param, ParseIntPipe, Query } from '@nestjs/common';
import { User } from '@prisma/client';
import { ApiController, Authorized, CurrentUser, Delete, Get } from 'core/decorators';
import { FindChatEventsRequestDTO, FindChatsRequestDTO } from './dto/request/find.request';
import {
    FindChatEventsResponseDTO,
    FindChatsResponseDTO,
    UnreadCount
} from './dto/response/find.response';
import ChatService from './chat.service';
import { ChatResponseModel } from './dto/response/model';
import { BooleanResponseDTO } from 'core/response/response.schema';

@ApiController({
    path: '/chats',
    tag: 'chat',
    version: '1'
})
export default class ChatController {
    constructor(private _chatService: ChatService) {}

    @Authorized()
    @Get({
        path: '/',
        description: 'Find Chats',
        response: FindChatsResponseDTO
    })
    FindChats(
        @Query() data: FindChatsRequestDTO,
        @CurrentUser() user: User
    ): Promise<FindChatsResponseDTO> {
        return this._chatService.FindChats(data, user);
    }

    @Authorized()
    @Get({
        path: '/total-count',
        description: 'Find Unread Count',
        response: UnreadCount
    })
    TotalCount(@CurrentUser() user: User) {
        return this._chatService.UnreadCount(user);
    }

    @Authorized()
    @Get({
        path: '/:id',
        description: 'Find Chat By ID',
        response: ChatResponseModel
    })
    FindChatById(
        @Param('id', ParseIntPipe) id: number,
        @CurrentUser() user: User
    ): Promise<ChatResponseModel> {
        return this._chatService.FindChatById(id, user.id, false);
    }

    @Authorized()
    @Delete({
        path: '/:id',
        description: 'Delete Chat by ID',
        response: BooleanResponseDTO
    })
    DeleteChat(
        @Param('id', ParseIntPipe) id: number,
        @CurrentUser() user: User
    ): Promise<BooleanResponseDTO> {
        return this._chatService.DeleteChat(id, user);
    }

    @Authorized()
    @Get({
        path: '/:id/events',
        description: 'Find Chat Events',
        response: FindChatsResponseDTO
    })
    FindChatEvents(
        @Param('id', ParseIntPipe) chatId: number,
        @Query() data: FindChatEventsRequestDTO,
        @CurrentUser() user: User
    ): Promise<FindChatEventsResponseDTO> {
        return this._chatService.FindChatEvents(chatId, data, user);
    }
}
