import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum SubscriptionPlanType {
    PREMIUM = 1,
    FREEMIUM = 2
}

export class SubscriptionPlanResponseModel {
    @ApiProperty()
    id: number;

    @ApiProperty()
    iosProductId: string;

    @ApiProperty()
    androidProductId: string;

    @ApiProperty({ enum: SubscriptionPlanType })
    type: SubscriptionPlanType;

    @ApiPropertyOptional()
    price?: number;
}

export class UserSubscriptionResponseModel {
    @ApiProperty()
    id: number;

    @ApiProperty()
    userId: number;

    @ApiProperty()
    subscriptionPlanId: number;

    @ApiProperty()
    expiredAt: Date;

    @ApiProperty({ type: SubscriptionPlanResponseModel })
    subscriptionPlan: Partial<SubscriptionPlanResponseModel>;
}
