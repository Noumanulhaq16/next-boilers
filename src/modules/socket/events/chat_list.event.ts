import { SocketEventType } from '../../../constants';
import BaseSocketEvent from './base.event';
import { Server, Socket } from 'socket.io';

export default class ChatListEvent extends BaseSocketEvent {
    static eventName: string = SocketEventType.CHAT_LIST;
    data: any = {};

    constructor(socket: Socket, data: any, io: Server) {
        super(socket, io);
        this.data = data;
    }

    GetName(): string {
        return ChatListEvent.eventName;
    }

    GetData() {
        return this.data;
    }
}
