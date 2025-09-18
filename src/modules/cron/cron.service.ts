import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Logger } from 'helpers/logger.helper';
import AppConfig from 'configs/app.config';
import DatabaseService from 'database/database.service';
import { Now, SubtractDays, SubtractHours } from 'helpers/date.helper';
import { Prisma, UserInteractionType } from '@prisma/client';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EventType } from '../../constants';

@Injectable()
export default class CronService {
    constructor(private _dbService: DatabaseService, private _eventEmitter: EventEmitter2) {}

    @Cron(CronExpression.EVERY_10_MINUTES, { name: 'test cron' })
    async TestCron() {
        if (AppConfig.APP.WITH_SCHEDULE !== '1') {
            return;
        }
        Logger.Info(`Test Cron`, '[CRON]');
    }

    // @Cron(CronExpression.EVERY_6_HOURS, { name: 'remove-user-dislike' })
    // async RemoveUserDislike() {
    //     if (AppConfig.APP.WITH_SCHEDULE !== '1') {
    //         return;
    //     }

    //     const maxTime = SubtractDays(Now(), 15); // Remove user from dislike list after 15 days

    //     await this._dbService
    //         .$executeRaw`${Prisma.sql`DELETE FROM "UserInteraction" ut WHERE ut."type"::text = ${UserInteractionType.DISLIKED} AND ut."updatedAt" <= ${maxTime}`}`;

    //     Logger.Info(`Remove User Dislike`, '[CRON]');
    // }

    @Cron(CronExpression.EVERY_5_MINUTES, { name: 'cron-unsubscribe-users' })
    async UnsubscribeUsersCron() {
        if (AppConfig.APP.WITH_SCHEDULE !== '1') {
            return;
        }

        this._eventEmitter.emit(EventType.UNSUBSCRIBE_USERS);
        Logger.Info(`Unsubscribe Users Cron`, '[CRON]');
    }
}
