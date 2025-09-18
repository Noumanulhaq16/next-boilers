import { Module } from '@nestjs/common';
import DatabaseModule from 'database/database.module';
import SubscriptionController from './subscription.controller';
import SubscriptionService from './subscription.service';
import SocketModule from 'modules/socket/socket.module';

@Module({
    imports: [DatabaseModule, SocketModule],
    exports: [SubscriptionService],
    providers: [SubscriptionService],
    controllers: [SubscriptionController]
})
export default class SubscriptionModule {}
