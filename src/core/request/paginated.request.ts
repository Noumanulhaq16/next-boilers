import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsPositive, IsString, Min, Max } from 'class-validator';
import { TrimString } from 'core/decorators';
import { ParseToInt } from 'core/decorators/transform.decorator';

export enum OrderDirection {
    ASC = 'ASC',
    DESC = 'DESC'
}

export default class PaginatedRequest {
    @ApiPropertyOptional()
    @IsOptional()
    @ParseToInt()
    @IsInt()
    @IsPositive()
    @Max(999999)
    page: number;

    @ApiPropertyOptional()
    @IsOptional()
    @ParseToInt()
    @IsInt()
    @Min(-1)
    @Max(999999)
    limit: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @TrimString()
    column: string;

    @ApiPropertyOptional({ enum: OrderDirection })
    @IsOptional()
    @IsEnum(OrderDirection)
    direction: OrderDirection;
}
