import { Server, Socket } from 'socket.io';
import { SocketEventType } from '../../../constants';
import BaseSocketEvent from './base.event';

export default class ConnectedSocketEvent extends BaseSocketEvent {
    static eventName: string = SocketEventType.CONNECT;

    constructor(socket: Socket, io: Server) {
        super(socket, io);
    }

    GetName(): string {
        return ConnectedSocketEvent.eventName;
    }

    GetData() {
        return {};
    }
}
