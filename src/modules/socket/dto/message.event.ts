import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, IsInt, IsString, ValidateIf } from 'class-validator';
import { TrimString } from 'core/decorators';
import { IsOptionalCustom } from 'core/decorators/validate.decorator';

export class MessageSocketEventDTO {
    @ApiProperty()
    @IsInt()
    chatId: number;

    @ApiProperty()
    @ValidateIf((obj: MessageSocketEventDTO) => !obj.mediaIds?.length)
    @IsString()
    @TrimString()
    content: string;

    @ApiPropertyOptional({ type: Number, isArray: true })
    @IsOptionalCustom()
    @IsArray()
    @ArrayMinSize(1)
    @IsInt({ each: true })
    mediaIds?: number[];
}
