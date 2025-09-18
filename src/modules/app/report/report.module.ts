import { Module } from '@nestjs/common';
import DatabaseModule from 'database/database.module';
// import QueueModule from 'modules/queue/queue.module';
import ReportController from './report.controller';
import ReportService from './report.service';

@Module({
    imports: [DatabaseModule],
    exports: [ReportService],
    providers: [ReportService],
    controllers: [ReportController]
})
export default class ReportModule {}
