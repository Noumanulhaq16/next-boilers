import { Module } from '@nestjs/common';
import DatabaseModule from 'database/database.module';
import ChatController from './chat.controller';
import ChatService from './chat.service';

@Module({
    imports: [DatabaseModule],
    exports: [ChatService],
    providers: [ChatService],
    controllers: [ChatController]
})
export default class ChatModule {}
