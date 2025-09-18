import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReportReason } from '@prisma/client';
import {
    ArrayMinSize,
    IsArray,
    IsEnum,
    IsInt,
    IsString,
    Length,
    ValidateIf
} from 'class-validator';
import { TrimString } from 'core/decorators';
import { IsOptionalCustom } from 'core/decorators/validate.decorator';

export class CreateReportRequestDTO {
    @ApiPropertyOptional()
    @IsOptionalCustom()
    @IsString()
    @TrimString()
    @Length(1, 1000)
    title?: string;

    @ApiPropertyOptional()
    @IsString()
    @TrimString()
    @Length(1, 1000)
    @ValidateIf((obj: CreateReportRequestDTO) => obj.reason === ReportReason.OTHER || !obj.userId)
    description: string;

    @ApiProperty({ enum: ReportReason, default: ReportReason.OTHER })
    @IsEnum(ReportReason)
    reason: ReportReason;

    @ApiPropertyOptional()
    @IsOptionalCustom()
    @IsInt()
    userId?: number;

    @ApiPropertyOptional({ isArray: true, type: Number })
    @IsOptionalCustom()
    @IsArray()
    @ArrayMinSize(1)
    @IsInt({ each: true })
    mediaIds?: number[];
}
