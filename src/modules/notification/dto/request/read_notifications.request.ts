import { ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationModelEntityType } from '@prisma/client';
import { ArrayMinSize, IsArray, IsEnum, IsNumber } from 'class-validator';
import { IsOptionalCustom } from 'core/decorators/validate.decorator';

export class ReadNotificationsRequestDTO {
    @ApiPropertyOptional({ isArray: true, type: Number })
    @IsOptionalCustom()
    @IsArray()
    @ArrayMinSize(1)
    @IsNumber({}, { each: true })
    notificationIds?: number[];

    @ApiPropertyOptional({ enum: NotificationModelEntityType })
    @IsOptionalCustom()
    @IsEnum(NotificationModelEntityType)
    type?: NotificationModelEntityType;
}
