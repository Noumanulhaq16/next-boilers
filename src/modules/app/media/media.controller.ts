import { Body, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { MediaAccess, User } from '@prisma/client';
import { ApiController, Authorized, CurrentUser, Post, Put } from 'core/decorators';
import { LambdaAuthorized } from 'core/decorators/authorize.decorator';
import SaveThumbnailRequestDTO from './dto/request/save_thumbnail.request';
import {
    UploadFinalizeMediaRequestDTO,
    UploadInitiateMediaRequestDTO
} from './dto/request/upload.request';
import {
    UploadFinalizeMediaResponseDTO,
    UploadInitiateMediaResponseDTO
} from './dto/response/upload.response';
import MediaService from './media.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { UploadFileRequestDTO } from './dto/request/upload_file.request';

@ApiController({
    path: '/media',
    tag: 'media',
    version: '1'
})
export default class MediaController {
    constructor(private _mediaService: MediaService) {}

    @Authorized([], 'ALL')
    @Post({
        path: '/public/init',
        description: 'Upload public media',
        response: UploadInitiateMediaResponseDTO
    })
    UploadPublicInitiate(
        @Body() data: UploadInitiateMediaRequestDTO,
        @CurrentUser() user: User
    ): Promise<UploadInitiateMediaResponseDTO> {
        return this._mediaService.UploadInitiate(data, MediaAccess.PUBLIC, user);
    }

    @Authorized()
    @Post({
        path: '/init',
        description: 'Upload media',
        response: UploadInitiateMediaResponseDTO
    })
    UploadInitiate(
        @Body() data: UploadInitiateMediaRequestDTO,
        @CurrentUser() user: User
    ): Promise<UploadInitiateMediaResponseDTO> {
        return this._mediaService.UploadInitiate(data, MediaAccess.PRIVATE, user);
    }

    @Authorized([], 'ALL')
    @Post({
        path: '/finalize',
        description: 'Finalize media',
        response: UploadFinalizeMediaResponseDTO
    })
    UploadFinalize(
        @Body() data: UploadFinalizeMediaRequestDTO,
        @CurrentUser() user: User
    ): Promise<UploadFinalizeMediaResponseDTO> {
        return this._mediaService.UploadFinalize(data, user);
    }

    // @LambdaAuthorized()
    // @Put({
    //     description: 'Save thumbnail from Lambda function',
    //     path: '/thumbnail',
    //     response: BooleanResponseDTO
    // })
    // SaveThumbnail(@Body() data: SaveThumbnailRequestDTO): Promise<BooleanResponseDTO> {
    //     return this._mediaService.SaveThumbnail(data);
    // }

    @Authorized([], 'ALL')
    @Post({
        path: '/upload',
        description: 'upload media',
        response: UploadFinalizeMediaResponseDTO
    })
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('file'))
    UploadFile(
        @UploadedFile() file: Express.Multer.File,
        @Body() data: UploadFileRequestDTO,
        @CurrentUser() user: User
    ): Promise<UploadFinalizeMediaResponseDTO> {
        return this._mediaService.UploadFile(file, data, user);
    }
}
