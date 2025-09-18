import { ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationReadStatus } from '@prisma/client';
import { IsEnum } from 'class-validator';
import { IsOptionalCustom } from 'core/decorators/validate.decorator';
import PaginatedRequest from 'core/request/paginated.request';

export class FindNotificationsRequestDTO extends PaginatedRequest {
    @ApiPropertyOptional({ enum: NotificationReadStatus })
    @IsOptionalCustom()
    @IsEnum(NotificationReadStatus)
    readStatus?: NotificationReadStatus;
}
