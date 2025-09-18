import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export enum AnalyticsType {
    DAY = 'day',
    WEEK = 'week',
    MONTH = 'month',
    YEAR = 'year'
}

export class AnalyticsRequestDTO {
    @ApiProperty({ enum: AnalyticsType })
    @IsEnum(AnalyticsType)
    type: AnalyticsType;
}
