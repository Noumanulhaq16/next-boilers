import { Module } from '@nestjs/common';
import DatabaseModule from 'database/database.module';
import AnalyticsService from './analytics.service';
import AnalyticsController from './analytics.controller';

@Module({
    imports: [DatabaseModule],
    exports: [AnalyticsService],
    providers: [AnalyticsService],
    controllers: [AnalyticsController]
})
export default class AnalyticsModule {}
