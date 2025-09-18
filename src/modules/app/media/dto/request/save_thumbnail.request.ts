import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export default class SaveThumbnailRequestDTO {
    @ApiProperty()
    @IsString()
    path: string;

    @ApiProperty()
    @IsString()
    thumbPath: string;
}
