import { Server, Socket } from 'socket.io';
import { SocketEventType } from '../../../constants';
import BaseSocketEvent from './base.event';

export default class DisconnectedSocketEvent extends BaseSocketEvent {
    static eventName: string = SocketEventType.DISCONNECT;

    constructor(socket: Socket, io: Server) {
        super(socket, io);
    }

    GetName(): string {
        return DisconnectedSocketEvent.eventName;
    }

    GetData() {
        return {};
    }
}
