import { ApiProperty } from '@nestjs/swagger';
import { SocketEventType } from '../../../constants';
import BaseSocketEvent from './base.event';
import { Server, Socket } from 'socket.io';

export default class OnlineSocketEvent extends BaseSocketEvent {
    static eventName: string = SocketEventType.ONLINE_STATUS;

    data = <OnlineSocketEventData>{};

    constructor(socket: Socket, data: OnlineSocketEventData, io: Server) {
        super(socket, io);
        this.data.userId = data.userId;
        this.data.isOnline = data.isOnline;
    }

    GetName(): string {
        return OnlineSocketEvent.eventName;
    }

    GetData(): OnlineSocketEventData {
        return this.data;
    }
}

export class OnlineSocketEventData {
    @ApiProperty()
    userId: number;

    @ApiProperty()
    isOnline: boolean;
}
