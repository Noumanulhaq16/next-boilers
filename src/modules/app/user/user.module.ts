import { Module } from '@nestjs/common';
import DatabaseModule from 'database/database.module';
import AuthModule from 'modules/app/auth/auth.module';
import TokenModule from 'modules/app/token/token.module';
// import QueueModule from 'modules/queue/queue.module';
import AuthController from './auth.controller';
import UserController from './user.controller';
import UserService from './user.service';
import OAuthModule from 'modules/oauth/oauth.module';
import DeviceModule from '../device/device.module';
import ChatModule from '../chat/chat.module';
import RedisModule from 'core/cache/redis.module';
import NotificationModule from 'modules/notification/notification.module';

@Module({
    imports: [
        DatabaseModule,
        AuthModule,
        TokenModule,
        // QueueModule,
        OAuthModule,
        DeviceModule,
        ChatModule,
        RedisModule,
        NotificationModule
    ],
    exports: [UserService],
    providers: [UserService],
    controllers: [AuthController, UserController]
})
export default class UserModule {}
