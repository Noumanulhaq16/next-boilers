import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MediaType } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsArray, IsBoolean, IsEnum, IsIn, IsInt } from 'class-validator';
import { ParseToBoolean, ParseToInt } from 'core/decorators/transform.decorator';
import { IsOptionalCustom } from 'core/decorators/validate.decorator';
import PaginatedRequest from 'core/request/paginated.request';

export class FindGalleryMediaRequestDTO extends PaginatedRequest {
    @ApiPropertyOptional({ default: false })
    @IsOptionalCustom()
    @ParseToBoolean()
    @IsBoolean()
    featured?: boolean;

    @ApiPropertyOptional({
        isArray: true,
        type: MediaType,
        description: `Available values: ${[MediaType.IMAGE, MediaType.VIDEO].join(', ')}`
    })
    @IsOptionalCustom()
    @Transform(({ value }) => (Array.isArray(value) ? value.map((item) => item) : [value]))
    @IsArray()
    @IsEnum(MediaType, { each: true })
    @IsIn([MediaType.IMAGE, MediaType.VIDEO], {
        each: true
    })
    mediaType?: MediaType[];

    @ApiProperty()
    @ParseToInt()
    @IsInt()
    userId: number;
}
