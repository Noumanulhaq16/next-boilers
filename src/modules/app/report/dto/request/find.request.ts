import { ApiPropertyOptional } from '@nestjs/swagger';
import { ReportType } from '@prisma/client';
import { IsEnum } from 'class-validator';
import { IsOptionalCustom } from 'core/decorators/validate.decorator';
import SearchableRequest from 'core/request/searchable.request';

export class FindReportsRequestDTO extends SearchableRequest {
    @ApiPropertyOptional()
    @IsOptionalCustom()
    @IsEnum(ReportType)
    type?: ReportType;
}
