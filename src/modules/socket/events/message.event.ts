import { ChatEventResponseModel } from 'modules/app/chat/dto/response/model';
import { SocketEventType } from '../../../constants';
import { MessageSocketEventDTO } from '../dto/message.event';
import BaseSocketEvent from './base.event';
import { Server, Socket } from 'socket.io';

export default class MessageSocketEvent extends BaseSocketEvent {
    static eventName: string = SocketEventType.MESSAGE;

    data = <MessageSocketEventData>{};

    constructor(socket: Socket, data: MessageSocketEventDTO, io: Server) {
        super(socket, io);
        this.data.chatId = data.chatId;
        this.data.content = data.content;
        this.data.mediaIds = data.mediaIds || [];
    }

    GetName(): string {
        return MessageSocketEvent.eventName;
    }

    GetData(): MessageSocketEventData {
        return this.data;
    }
}

export class MessageSocketEventData extends ChatEventResponseModel {
    mediaIds?: number[];
}
