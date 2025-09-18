import { ApiProperty } from '@nestjs/swagger';
import { GalleryMediaResponseModel } from './model';

export class FindGalleryMediaResponseDTO {
    @ApiProperty({ isArray: true, type: GalleryMediaResponseModel })
    data: GalleryMediaResponseModel[];

    @ApiProperty()
    count: number;
}
