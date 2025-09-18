import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Socket } from 'socket.io';
import { UnAuthorizedWsException } from 'core/exceptions/response.exception';
import SocketHelper from './socket.helper';

@Injectable()
export default class SocketAuthGuard implements CanActivate {
    constructor(private _socketHelper: SocketHelper) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const ctx = context.switchToWs();
        const socket = ctx.getClient<Socket>();
        const socketData = await this._socketHelper.GetSocketDataById(socket.id);
        if (!socketData) {
            throw new UnAuthorizedWsException();
        }
        return true;
    }
}
