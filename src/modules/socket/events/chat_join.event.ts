import { SocketEventType } from '../../../constants';
import { ChatJoinSocketEventDTO } from '../dto/chat_join_event';
import BaseSocketEvent from './base.event';
import { Server, Socket } from 'socket.io';

export default class ChatJoinSocketEvent extends BaseSocketEvent {
    static eventName: string = SocketEventType.CHAT_JOIN;

    data = <ChatJoinSocketEventData>{};

    constructor(socket: Socket, data: ChatJoinSocketEventDTO, io: Server) {
        super(socket, io);
        this.data.userId = data.userId;
    }

    GetName(): string {
        return ChatJoinSocketEvent.eventName;
    }

    GetData(): ChatJoinSocketEventData {
        return this.data;
    }
}

interface ChatJoinSocketEventData {
    userId: number;
}
