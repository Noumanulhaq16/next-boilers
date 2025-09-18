import { Module } from '@nestjs/common';
import DatabaseModule from 'database/database.module';
import SportService from './sport.service';
import SportController from './sport.controller';

@Module({
    imports: [DatabaseModule],
    exports: [SportService],
    providers: [SportService],
    controllers: [SportController]
})
export default class SportModule {}
