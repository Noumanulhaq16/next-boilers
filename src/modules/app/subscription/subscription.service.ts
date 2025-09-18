import { Injectable } from '@nestjs/common';
import { Prisma, User, UserStatus } from '@prisma/client';
import { ExceptionMessage } from '../../../constants';
import {
    BadRequestException,
    FatalErrorException,
    NotFoundException
} from 'core/exceptions/response.exception';
import { BooleanResponseDTO } from 'core/response/response.schema';
import DatabaseService from 'database/database.service';
import { GetOrderOptions, GetPaginationOptions } from 'helpers/util.helper';
import { Logger } from 'helpers/logger.helper';
import { SubscriptionPlanType } from './dto/response/model';
import { AllowDateFormat, ConvertToDate, ConvertToSpecificFormat, Now } from 'helpers/date.helper';
import { SocketGateway } from 'modules/socket/socket.gateway';

@Injectable()
export default class SubscriptionService {
    constructor(private _dbService: DatabaseService, private _socketGateway: SocketGateway) {}

    private async getFreemiumSubscriptionPlan() {
        const freemium = await this._dbService.subscriptionPlan.findFirst({
            where: { type: { equals: 2 } }
        });
        if (!freemium) {
            throw new BadRequestException('FREEMIUM SUBSCRIPTION PLAN DOES NOT EXIST');
        }
        return freemium;
    }

    async HandleSubscriptionWebhook(request: any) {
        if (!(request?.event?.store === 'PLAY_STORE' || request?.event?.store === 'APP_STORE')) {
            throw new BadRequestException();
        }
        const subscriptionPlan = await this._dbService.subscriptionPlan.findFirst({
            where: {
                ...(request?.event?.store === 'PLAY_STORE' && {
                    androidProductId: request?.event?.product_id
                }),
                ...(request?.event?.store === 'APP_STORE' && {
                    iosProductId: request?.event?.product_id
                })
            }
        });
        if (!subscriptionPlan) {
            throw new NotFoundException(ExceptionMessage.payment.subscription_plan_not_found);
        }

        const userId = Number(request?.event?.app_user_id);

        const userSubscription = await this._dbService.userSubscription.findFirst({
            where: { userId },
            select: {
                id: true,
                startedAt: true,
                expiredAt: true,
                deviceType: true,
                subscriptionPlan: {
                    select: {
                        type: true
                    }
                }
            }
        });

        if (!userSubscription) {
            throw new BadRequestException('User Subscription is not initialized');
        }

        const expiredAt = new Date(request.event?.purchased_at_ms);
        const startedAt = new Date(request?.event?.purchased_at_ms);
        switch (request.event.type) {
            case 'INITIAL_PURCHASE':
                await this._dbService.userSubscription.update({
                    where: { id: userSubscription.id },
                    data: {
                        expiredAt,
                        startedAt,
                        subscriptionPlanId: subscriptionPlan.id
                    }
                });
                console.log('Initial Purchase Handled Successfully');
                this._socketGateway.io.emit('subscription-change-status', {
                    userId,
                    subscriptionPlanType: 1
                });
                break;

            case 'RENEWAL':
                // if (userSubscription.subscriptionPlan.type === 2) {
                //     console.log('Invalid Purchase Type: Expected Initial Purchase');
                //     break;
                // }
                await this._dbService.userSubscription.update({
                    where: { id: userSubscription.id },
                    data: { expiredAt, startedAt, subscriptionPlanId: subscriptionPlan.id }
                });
                console.log('Renewal Handled Successfully');
                this._socketGateway.io.emit('subscription-change-status', {
                    userId,
                    subscriptionPlanType: 1
                });
                break;

            case 'CANCELLATION':
                if (userSubscription.subscriptionPlan.type === 2) {
                    throw new BadRequestException('Invalid Type: Freemium Cannot Be Cancelled');
                }
                const freemiumPlan = await this.getFreemiumSubscriptionPlan();
                await this._dbService.userSubscription.update({
                    where: { id: userSubscription.id },
                    data: {
                        subscriptionPlanId: freemiumPlan.id,
                        expiredAt: new Date()
                    }
                });
                console.log('Cancellation Handled Successfully');
                this._socketGateway.io.emit('subscription-change-status', {
                    userId,
                    subscriptionPlanType: 2
                });
                break;

            case 'EXPIRATION':
                if (userSubscription.subscriptionPlan.type === 2) {
                    console.log('Invalid Type: Freemium Cannot Expire');
                    break;
                }
                const freemium = await this.getFreemiumSubscriptionPlan();
                await this._dbService.userSubscription.update({
                    where: { id: userSubscription.id },
                    data: {
                        subscriptionPlanId: freemium.id,
                        expiredAt: null,
                        startedAt: null
                    }
                });
                console.log('Expiration Handled Successfully');
                this._socketGateway.io.emit('subscription-change-status', {
                    userId,
                    subscriptionPlanType: 2
                });
                break;

            default:
                console.log(`Unhandled event type: ${request.event.type}`, request);
                break;
        }

        // const expiredAt = ConvertToDate(
        //     ConvertToSpecificFormat(
        //         new Date(request?.event?.expiration_at_ms * 1000) as any,
        //         AllowDateFormat.DateTime
        //     ),
        //     AllowDateFormat.DateTime
        // );
        // const startedAt = ConvertToDate(
        //     ConvertToSpecificFormat(
        //         new Date(request?.event?.purchased_at_ms * 1000) as any,
        //         AllowDateFormat.DateTime
        //     ),
        //     AllowDateFormat.DateTime
        // );

        // if (startedAt && userSubscription.startedAt && startedAt < userSubscription.startedAt) {
        //     return; // upgrade or downgrade (order of webhooks not correct)
        // }

        // const freemiumSubscriptionPlan = await this._dbService.subscriptionPlan.findFirst({
        //     where: { type: SubscriptionPlanType.FREEMIUM },
        //     select: { id: true }
        // });
        // if (!freemiumSubscriptionPlan) {
        //     throw new NotFoundException(ExceptionMessage.payment.subscription_plan_not_found);
        // }

        // await this._dbService.$transaction(async (tx) => {
        //     await tx.userSubscription.update({
        //         where: { userId },
        //         data: {
        //             subscriptionPlanId: subscriptionPlan.id,
        //             expiredAt: expiredAt,
        //             startedAt: startedAt
        //         }
        //     });

        //     if (expiredAt <= Now()) {
        //         await tx.userSubscription.update({
        //             where: { userId },
        //             data: { subscriptionPlanId: freemiumSubscriptionPlan.id }
        //         });
        //     }
        // });
    }
}
