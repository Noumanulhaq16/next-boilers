import { Socket, Server } from 'socket.io';
import BaseSocketEvent from './base.event';
import { LeaveRoomDto } from '../dto/leave_room_dto';
import { SocketEventType } from '../../../constants';

export default class LeaveRoomEvent extends BaseSocketEvent {
    static eventName: string = SocketEventType.LEAVE_ROOM;

    data = <LeaveRoomDto>{};
    constructor(socket: Socket, data: LeaveRoomDto, io: Server) {
        super(socket, io);
        this.data.roomId = data.roomId;
    }

    GetName(): string {
        return LeaveRoomEvent.eventName;
    }

    GetData() {
        return this.data;
    }
}
