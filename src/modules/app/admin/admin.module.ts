import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import DatabaseModule from 'database/database.module';
import AuthModule from '../auth/auth.module';
import DeviceModule from '../device/device.module';
import RedisModule from 'core/cache/redis.module';
import SocketModule from 'modules/socket/socket.module';

@Module({
    imports: [DatabaseModule, AuthModule, DeviceModule, RedisModule, SocketModule],
    controllers: [AdminController],
    providers: [AdminService]
})
export class AdminModule {}
