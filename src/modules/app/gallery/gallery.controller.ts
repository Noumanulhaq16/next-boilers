import { Body, Query } from '@nestjs/common';
import { User, UserType } from '@prisma/client';
import { ApiController, Authorized, CurrentUser, Get, Post, Put } from 'core/decorators';
import GalleryService from './gallery.service';
import { BooleanResponseDTO } from 'core/response/response.schema';
import { ChangeGalleryMediaRequestDTO } from './dto/request/change.request';
import { FindGalleryMediaRequestDTO } from './dto/request/find.request';
import { FindGalleryMediaResponseDTO } from './dto/response/find.response';

@ApiController({
    path: '/gallery-media',
    tag: 'gallery-media',
    version: '1'
})
export default class GalleryController {
    constructor(private _galleryService: GalleryService) {}

    @Authorized([UserType.ATHLETE, UserType.COACH])
    @Post({
        path: '/',
        description: 'Create/Delete Gallery Media',
        response: BooleanResponseDTO
    })
    ChangeGalleryMedia(
        @Body() data: ChangeGalleryMediaRequestDTO,
        @CurrentUser() user: User
    ): Promise<BooleanResponseDTO> {
        return this._galleryService.ChangeGalleryMedia(data, user);
    }

    @Authorized([])
    @Get({
        path: '/',
        description: 'Find Gallery Media',
        response: FindGalleryMediaResponseDTO
    })
    Find(
        @Query() data: FindGalleryMediaRequestDTO,
        @CurrentUser() user: User
    ): Promise<FindGalleryMediaResponseDTO> {
        return this._galleryService.Find(data, user);
    }
}
