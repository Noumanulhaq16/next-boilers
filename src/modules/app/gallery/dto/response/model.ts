import { ApiProperty } from '@nestjs/swagger';
import { MediaResponseModel } from 'modules/app/media/dto/response/model';

export class GalleryMediaResponseModel {
    @ApiProperty()
    id: number;

    @ApiProperty()
    userId: number;

    @ApiProperty()
    mediaId: number;

    @ApiProperty({ type: MediaResponseModel })
    media: MediaResponseModel;
}
