import { ApiProperty } from '@nestjs/swagger';
import { MediaAccess, MediaType } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class UploadFileRequestDTO {
    @ApiProperty({ enum: MediaType })
    @IsEnum(MediaType)
    mediaType: MediaType;

    @ApiProperty({ enum: MediaAccess })
    @IsEnum(MediaAccess)
    accessType: MediaAccess;

    @ApiProperty({ type: 'string', format: 'binary' })
    file: Express.Multer.File;
}
