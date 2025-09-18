import { ApiPropertyOptional } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, IsBoolean, IsInt } from 'class-validator';
import { IsOptionalCustom } from 'core/decorators/validate.decorator';

export class ChangeGalleryMediaRequestDTO {
    @ApiPropertyOptional({ isArray: true, type: Number })
    @IsOptionalCustom()
    @IsArray()
    @ArrayMinSize(1)
    @IsInt({ each: true })
    createIds?: number[];

    @ApiPropertyOptional({ isArray: true, type: Number })
    @IsOptionalCustom()
    @IsArray()
    @ArrayMinSize(1)
    @IsInt({ each: true })
    deleteIds?: number[];

    @ApiPropertyOptional({ default: false })
    @IsOptionalCustom()
    @IsBoolean()
    featured?: boolean;
}
