import { WsException } from '@nestjs/websockets';
import { SocketRoomType } from '../../../constants';
import { Server, Socket } from 'socket.io';

export default abstract class BaseSocketEvent {
    private _socket: Socket;
    private _IO: Server;

    constructor(socket: Socket, io?: Server) {
        this._socket = socket;
        this._IO = io;
    }

    protected abstract GetName(): string;

    protected abstract GetData(): Object;

    private GetChatRoom(chatId: number): string {
        return SocketRoomType.CHAT + ':' + chatId;
    }

    private GetChatList(userId: number): string {
        return SocketRoomType.LIST + ':' + userId;
    }

    public BroadcastToChatList(userId: number) {
        this._socket.broadcast.to(this.GetChatList(userId)).emit(this.GetName(), this.GetData());
    }

    public GetSocket(): Socket {
        return this._socket;
    }

    public GetIO(): Server {
        return this._IO;
    }

    public JoinChatList(userId: number) {
        this._socket.join(this.GetChatList(userId));
    }

    public JoinChatRoom(chatId: number) {
        this._socket.join(this.GetChatRoom(chatId));
    }
    public JoinChatRooms(chatIds: number[]) {
        this._socket.join(chatIds.map((chatId) => this.GetChatRoom(chatId)));
    }

    public LeaveChatRoom(chatId: number) {
        this._socket.leave(this.GetChatRoom(chatId));
    }

    public BroadcastToAllConnectedClients() {
        this._socket.broadcast.emit(this.GetName(), this.GetData());
    }

    public IOEmitToAllConnectedClients() {
        this._IO.emit(this.GetName(), this.GetData());
    }

    public BroadcastToChatRoom(chatId: number) {
        this._socket.broadcast.to(this.GetChatRoom(chatId)).emit(this.GetName(), this.GetData());
    }

    public EmitToIndividualSocket(socketId: string) {
        this._socket.to(socketId).emit(this.GetName(), this.GetData());
    }

    public IOEmitToIndividualSocket(io, socketId: string) {
        io.to(socketId).emit(this.GetName(), this.GetData());
    }

    // public EmitError(statusCode: number, messageData?: any) {
    //     const error: { status: number; message: string } = {
    //         status: statusCode,
    //         message: messageData
    //     };
    //     throw new WsException(error);
    // }

    public SocketJoinChatRoom(socket: Socket, chatId: number) {
        socket.join(this.GetChatRoom(chatId));
    }

    public SocketIdsJoinChatRoom(socketIds: Array<string>, chatId: number) {
        for (let i = 0; i < socketIds.length; i++) {
            const socket = this.GetIO()?.sockets?.sockets?.get(socketIds[i]);
            if (socket) {
                this.SocketJoinChatRoom(socket, chatId);
            }
        }
    }

    public SendToSelf() {
        this._socket.emit(this.GetName(), this.GetData());
    }
}
