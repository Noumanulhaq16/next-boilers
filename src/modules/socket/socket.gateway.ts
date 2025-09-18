import {
    ConnectedSocket,
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer
} from '@nestjs/websockets';
import { SocketEventType } from '../../constants';
import { Logger } from 'helpers/logger.helper';
import { Server, Socket } from 'socket.io';
import SocketEventHandler from './socket_event.handler';
import { UseGuards, UseInterceptors } from '@nestjs/common';
// import { TranslatorService } from 'nestjs-translator';
import { TranslatorModuleOptions } from 'i18n/config';
import SocketAuthGuard from './socket_auth.guard';
import ConnectedSocketEvent from './events/connected.event';
import DisconnectedSocketEvent from './events/disconnected.event';
import { ChatJoinSocketEventDTO } from './dto/chat_join_event';
import ChatJoinSocketEvent from './events/chat_join.event';
import { MessageSocketEventDTO } from './dto/message.event';
import MessageSocketEvent, { MessageSocketEventData } from './events/message.event';
import { ReadMessageSocketEventDTO } from './dto/read_message.event';
import ReadMessageSocketEvent, { ReadMessageSocketEventData } from './events/read_message.event';
import { SocketErrorInterceptor } from 'core/interceptors/socket_error.interceptor';
import { ValidateDTO } from 'helpers/util.helper';
// import { AsyncApiOperation } from 'nestjs-asyncapi';
import { OnlineSocketEventData } from './events/online.event';
import { LeaveRoomDto } from './dto/leave_room_dto';
import LeaveEventRoom from './events/leave_room_event';
import LeaveRoomEvent from './events/leave_room_event';

@UseInterceptors()
// new SocketErrorInterceptor(
//     new TranslatorService(
//         TranslatorModuleOptions.defaultLang,
//         TranslatorModuleOptions.translationSource,
//         TranslatorModuleOptions.requestKeyExtractor
//     )
// )
// @UseFilters(
//     new SocketExceptionFilter(
//         new TranslatorService(
//             TranslatorModuleOptions.defaultLang,
//             TranslatorModuleOptions.translationSource,
//             TranslatorModuleOptions.requestKeyExtractor
//         )
//     )
// )
@UseGuards(SocketAuthGuard)
@WebSocketGateway()
export class SocketGateway implements OnGatewayInit, OnGatewayDisconnect, OnGatewayConnection {
    constructor(private _socketEventHandler: SocketEventHandler) {}
    @WebSocketServer() io: Server;

    afterInit() {
        Logger.Info('Initialized', '[SOCKET_GATEWAY]');
        this.io.use(this._socketEventHandler.SocketAuthentication.bind(this._socketEventHandler));
    }

    async handleConnection(socket: Socket) {
        Logger.Info(`Socket id: ${socket.id} connected`, '[SOCKET_GATEWAY]');
        const event = new ConnectedSocketEvent(socket, this.io);
        await this._socketEventHandler.OnConnectedEvent(event);
    }

    async handleDisconnect(socket: Socket) {
        Logger.Info(`Socket id:${socket.id} disconnected`, '[SOCKET_GATEWAY]');
        const event = new DisconnectedSocketEvent(socket, this.io);
        await this._socketEventHandler.OnDisconnectedEvent(event);
    }

    @SubscribeMessage(SocketEventType.CHAT_JOIN)
    // @AsyncApiOperation({
    //     channel: SocketEventType.CHAT_JOIN,
    //     message: { payload: ChatJoinSocketEventDTO },
    //     type: 'pub',
    //     summary: 'chat join (initiate new chat or join existing one)'
    // })
    async ChatJoinEvent(
        @ConnectedSocket() socket: Socket,
        @MessageBody() data: ChatJoinSocketEventDTO
    ) {
        try {
            await ValidateDTO(ChatJoinSocketEventDTO, data);
            const event = new ChatJoinSocketEvent(socket, data, this.io);
            return await this._socketEventHandler.OnChatJoinEvent(event);
        } catch (err) {
            return this._socketEventHandler.HandleEventException(err);
        }
    }

    @SubscribeMessage(SocketEventType.MESSAGE)
    // @AsyncApiOperation({
    //     channel: SocketEventType.MESSAGE,
    //     message: { payload: MessageSocketEventDTO },
    //     type: 'pub',
    //     summary: 'send a message'
    // })
    async MessageEvent(
        @ConnectedSocket() socket: Socket,
        @MessageBody() data: MessageSocketEventDTO
    ) {
        try {
            await ValidateDTO(MessageSocketEventDTO, data);
            const event = new MessageSocketEvent(socket, data, this.io);
            return await this._socketEventHandler.OnMessageEvent(event);
        } catch (err) {
            return this._socketEventHandler.HandleEventException(err);
        }
    }

    @SubscribeMessage(SocketEventType.READ_MESSAGE)
    // @AsyncApiOperation({
    //     channel: SocketEventType.READ_MESSAGE,
    //     message: { payload: ReadMessageSocketEventDTO },
    //     type: 'pub',
    //     summary: 'read a message'
    // })
    async ReadMessageEvent(
        @ConnectedSocket() socket: Socket,
        @MessageBody() data: ReadMessageSocketEventDTO
    ) {
        try {
            await ValidateDTO(ReadMessageSocketEventDTO, data);
            const event = new ReadMessageSocketEvent(socket, data, this.io);
            return await this._socketEventHandler.OnReadMessageEvent(event);
        } catch (err) {
            return this._socketEventHandler.HandleEventException(err);
        }
    }

    @SubscribeMessage(SocketEventType.LEAVE_ROOM)
    async leaveRoom(@ConnectedSocket() socket: Socket, @MessageBody() data: LeaveRoomDto) {
        try {
            await ValidateDTO(LeaveRoomDto, data);
            const event = new LeaveRoomEvent(socket, data, this.io);
            await this._socketEventHandler.OnLeaveRoomEvent(event);
        } catch (err) {
            return this._socketEventHandler.HandleEventException(err);
        }
    }

    /* Below functions are just for the purpose of API documentation */
    // @AsyncApiOperation({
    //     channel: SocketEventType.ONLINE_STATUS,
    //     message: { payload: OnlineSocketEventData },
    //     type: 'sub',
    //     summary: 'listen for online status change'
    // })
    // listenOnlineStatusEvent() {}

    // @AsyncApiOperation({
    //     channel: SocketEventType.READ_MESSAGE,
    //     message: { payload: ReadMessageSocketEventData },
    //     type: 'sub',
    //     summary: 'listen for read message event'
    // })
    // listenReadMessageEvent() {}

    // @AsyncApiOperation({
    //     channel: SocketEventType.MESSAGE,
    //     message: { payload: MessageSocketEventData },
    //     type: 'sub',
    //     summary: 'listen for message event'
    // })
    // listenMessageEvent() {}
}
