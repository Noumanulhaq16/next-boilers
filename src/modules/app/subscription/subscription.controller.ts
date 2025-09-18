import { Body, Param, ParseIntPipe, Query } from '@nestjs/common';
import { User, UserType } from '@prisma/client';
import { ApiController, Authorized, CurrentUser, Delete, Get, Post } from 'core/decorators';
import { BooleanResponseDTO } from 'core/response/response.schema';
import SubscriptionService from './subscription.service';

@ApiController({
    path: '/subscriptions',
    tag: 'subscriptions',
    version: '1'
})
export default class SubscriptionController {
    constructor(private _subscriptionService: SubscriptionService) {}

    @Post({
        path: '/webhook',
        description: 'Revenue cat Webhook',
        response: Boolean
    })
    async HandleSubscriptionWebhook(@Body() data) {
        console.log(data, 'Webhook data');
        return await this._subscriptionService.HandleSubscriptionWebhook(data);
    }
}
