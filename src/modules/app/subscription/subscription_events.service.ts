import { Injectable } from '@nestjs/common';
import { EventType, ExceptionMessage } from '../../../constants';
import DatabaseService from 'database/database.service';
import { OnEvent } from '@nestjs/event-emitter';
import { Now } from 'helpers/date.helper';
import { UserType } from '@prisma/client';
import { SubscriptionPlanType } from './dto/response/model';
import { NotFoundException } from 'core/exceptions/response.exception';

@Injectable()
export default class SubscriptionEventService {
    constructor(private _dbService: DatabaseService) {}

    @OnEvent(EventType.UNSUBSCRIBE_USERS)
    async HandleUnsubscribeUsersEvent() {
        const freemiumSubscriptionPlan = await this._dbService.subscriptionPlan.findFirst({
            where: { type: SubscriptionPlanType.FREEMIUM },
            select: { id: true }
        });
        if (!freemiumSubscriptionPlan) {
            throw new NotFoundException(ExceptionMessage.payment.subscription_plan_not_found);
        }

        await this._dbService.userSubscription.updateMany({
            where: {
                user: {
                    type: { in: [UserType.ATHLETE, UserType.COACH] },
                    deletedAt: null
                },
                expiredAt: { lte: Now() }
            },
            data: { subscriptionPlanId: freemiumSubscriptionPlan.id }
        });
    }
}
