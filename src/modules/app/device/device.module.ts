import { Module } from '@nestjs/common';
import DatabaseModule from 'database/database.module';
import DeviceService from './device.service';

@Module({
    imports: [DatabaseModule],
    exports: [DeviceService],
    providers: [DeviceService],
    controllers: []
})
export default class DeviceModule {}
