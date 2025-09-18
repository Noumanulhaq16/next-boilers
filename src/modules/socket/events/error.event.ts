import { SocketEventType } from '../../../constants';
import BaseSocketEvent from './base.event';
import { Socket } from 'socket.io';

export default class ErrorSocketEvent extends BaseSocketEvent {
    static eventName: string = SocketEventType.SOCKET_ERROR;

    status: number;
    message: string;
    errors?: any;

    constructor(socket: Socket, data: ErrorSocketEventData) {
        super(socket);
        this.status = data.status;
        this.message = data.message;
        this.errors = data.errors;
    }

    GetName(): string {
        return ErrorSocketEvent.eventName;
    }

    GetData(): { error: ErrorSocketEventData } {
        return {
            error: {
                status: this.status,
                message: this.message,
                errors: this.errors
            }
        };
    }
}

interface ErrorSocketEventData {
    status: number;
    message: string;
    errors?: any;
}
