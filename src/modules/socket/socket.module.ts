import { Module } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';
import SocketEventHandler from './socket_event.handler';
import DatabaseModule from 'database/database.module';
import SocketAuthGuard from './socket_auth.guard';
import AuthModule from 'modules/app/auth/auth.module';
import SocketHelper from './socket.helper';
import RedisModule from 'core/cache/redis.module';
import ChatModule from 'modules/app/chat/chat.module';
import NotificationModule from 'modules/notification/notification.module';

@Module({
    imports: [DatabaseModule, RedisModule, AuthModule, ChatModule, NotificationModule],
    exports: [SocketGateway, SocketHelper],
    providers: [SocketGateway, SocketEventHandler, SocketAuthGuard, SocketHelper]
})
export default class SocketModule {}
