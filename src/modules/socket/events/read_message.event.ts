import { ApiProperty } from '@nestjs/swagger';
import { SocketEventType } from '../../../constants';
import { ReadMessageSocketEventDTO } from '../dto/read_message.event';
import BaseSocketEvent from './base.event';
import { Server, Socket } from 'socket.io';

export default class ReadMessageSocketEvent extends BaseSocketEvent {
    static eventName: string = SocketEventType.READ_MESSAGE;

    data = <ReadMessageSocketEventData>{};

    constructor(socket: Socket, data: ReadMessageSocketEventDTO, io: Server) {
        super(socket, io);
        this.data.chatId = data.chatId;
        this.data.chatEventId = data.chatEventId;
    }

    GetName(): string {
        return ReadMessageSocketEvent.eventName;
    }

    GetData(): ReadMessageSocketEventData {
        return this.data;
    }
}

export class ReadMessageSocketEventData {
    @ApiProperty()
    chatId: number;

    @ApiProperty()
    chatEventId: number;

    @ApiProperty()
    chatParticipantId: number;
}
