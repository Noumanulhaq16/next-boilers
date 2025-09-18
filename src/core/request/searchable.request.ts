import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';
import { TrimString } from 'core/decorators';
import { IsOptionalCustom } from 'core/decorators/validate.decorator';
import PaginatedRequest from './paginated.request';

export default class SearchableRequest extends PaginatedRequest {
    @ApiPropertyOptional()
    @IsOptionalCustom()
    @TrimString()
    @IsString()
    @Length(1)
    search?: string;
}
