import { ApiPropertyOptional, PickType } from '@nestjs/swagger';
import { IsInt } from 'class-validator';
import { ParseToInt } from 'core/decorators/transform.decorator';
import { IsOptionalCustom } from 'core/decorators/validate.decorator';
import PaginatedRequest from 'core/request/paginated.request';

export class FindChatsRequestDTO extends PickType(PaginatedRequest, ['limit']) {
    @ApiPropertyOptional()
    @IsOptionalCustom()
    @ParseToInt()
    @IsInt()
    beforeLastEventId?: number;
}

export class FindChatEventsRequestDTO extends PickType(PaginatedRequest, ['limit']) {
    @ApiPropertyOptional()
    @IsOptionalCustom()
    @ParseToInt()
    @IsInt()
    beforeChatEventId?: number;
}
