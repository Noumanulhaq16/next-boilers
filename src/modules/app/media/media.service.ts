import { Injectable } from '@nestjs/common';
import { MediaAccess, MediaStatus, MediaType, User } from '@prisma/client';
import AppConfig from 'configs/app.config';
import DatabaseService from 'database/database.service';
import {
    BadRequestException,
    ForbiddenException,
    NotFoundException
} from 'core/exceptions/response.exception';
import {
    UploadFinalizeMediaRequestDTO,
    UploadInitiateMediaRequestDTO
} from './dto/request/upload.request';
import {
    UploadFinalizeMediaResponseDTO,
    UploadInitiateMediaResponseDTO
} from './dto/response/upload.response';
import S3Service from './s3.service';
import { BooleanResponseDTO } from 'core/response/response.schema';
import SaveThumbnailRequestDTO from './dto/request/save_thumbnail.request';
import { ExceptionMessage } from '../../../constants';
import { UploadFileRequestDTO } from './dto/request/upload_file.request';
import { AccessType } from './types';

@Injectable()
export default class MediaService {
    constructor(private _dbService: DatabaseService, private _s3Service: S3Service) {}

    private _allowedMediaExtensions = {
        [MediaType.IMAGE]: ['png', 'jpg', 'bmp', 'jpeg', 'gif', 'MOV', 'MP4'],
        [MediaType.VIDEO]: ['mov', 'mp4', 'avi', 'flv', 'webm', 'MOV', 'MP4'],
        [MediaType.DOCUMENT]: ['pdf', 'doc', 'docx', 'xls', 'xlsx'],
        [MediaType.ARCHIVE]: ['zip', 'gzip'],
        [MediaType.OTHER]: []
    };

    //sizes are in kbs
    private _allowedMediaSize = {
        [MediaType.IMAGE]: 20 * 1024, // 20mb
        [MediaType.VIDEO]: 5 * 1024 * 1024, // 5gb
        [MediaType.DOCUMENT]: 100 * 1024, // 100mb
        [MediaType.ARCHIVE]: 1 * 1024 * 1024, // 1gb
        [MediaType.OTHER]: 0
    };

    private _getMediaExtension(fileName: string) {
        return fileName.slice(((fileName.lastIndexOf('.') - 1) >>> 0) + 2).toLowerCase();
    }

    async UploadInitiate(
        data: UploadInitiateMediaRequestDTO,
        mediaAccess: MediaAccess,
        user?: User
    ): Promise<UploadInitiateMediaResponseDTO> {
        const extension = this._getMediaExtension(data.name);
        if (!this._allowedMediaExtensions[data.type].includes(extension)) {
            throw new BadRequestException(ExceptionMessage.media.notSupported);
        }

        const sizeAllowed = data.size <= this._allowedMediaSize[data.type];
        if (!sizeAllowed) {
            throw new BadRequestException(ExceptionMessage.media.tooLarge);
        }

        const location = this._s3Service.CreateUniqueFilePath(data.name, data.type);
        const path = `${AppConfig.AWS.BUCKET_BASE_URL}/${location}`;

        const media = await this._dbService.media.create({
            data: {
                name: data.name,
                extension,
                location,
                path,
                thumbPath: path,
                type: data.type,
                status: MediaStatus.UPLOADING,
                access: mediaAccess,
                userId: user ? user.id : null,
                size: data.size
            }
        });

        const credentials = await this._s3Service.GetFileUploadPermissions(location, media.id);

        return {
            accessKeyId: credentials.accessKeyId,
            secretAccessKey: credentials.secretAccessKey,
            sessionToken: credentials.sessionToken,
            mediaId: media.id,
            bucket: AppConfig.AWS.BUCKET,
            location,
            region: AppConfig.AWS.REGION
        };
    }

    async UploadFinalize(
        data: UploadFinalizeMediaRequestDTO,
        user?: User
    ): Promise<UploadFinalizeMediaResponseDTO> {
        const media = await this._dbService.media.findFirst({
            where: { id: data.id }
        });
        if (!media) {
            throw new NotFoundException(ExceptionMessage.media.notFound);
        }

        if (media.access === MediaAccess.PRIVATE && (!user || user.id !== media.userId)) {
            throw new ForbiddenException(ExceptionMessage.media.notAllowed);
        }

        const s3Object = await this._s3Service.GetObjectHead(media.location);
        if (!s3Object) {
            throw new NotFoundException(ExceptionMessage.media.notFound);
        }

        const sizeAllowed = s3Object.contentLength <= this._allowedMediaSize[media.type];
        if (!sizeAllowed) {
            await this._dbService.media.update({
                where: { id: media.id },
                data: { status: MediaStatus.STALE }
            });
            await this._s3Service.UpdateObjectStaleTag(media.location);
            throw new BadRequestException(ExceptionMessage.media.tooLarge);
        }

        if (media.access === MediaAccess.PUBLIC) {
            await this._s3Service.UpdateObjectAccess(media.location, 'public-read');
        } else if (media.access === MediaAccess.PRIVATE) {
            await this._s3Service.UpdateObjectAccess(media.location, 'private');
        }

        await this._dbService.media.update({
            where: { id: media.id },
            data: {
                status: MediaStatus.READY,
                meta: {
                    ...(!!s3Object.duration && { duration: s3Object.duration }),
                    ...(!!s3Object.documentFor && { documentFor: s3Object.documentFor })
                }
            }
        });
        media.status = MediaStatus.READY;

        await this._s3Service.UpdateObjectIdTag(media.location, media.id);

        return media;
    }

    async SaveThumbnail(data: SaveThumbnailRequestDTO): Promise<BooleanResponseDTO> {
        const media = await this._dbService.media.findFirst({
            where: { location: data.path },
            select: { id: true }
        });
        if (!media) {
            throw new NotFoundException(ExceptionMessage.media.notFound);
        }

        await this._dbService.media.updateMany({
            where: { id: media.id },
            data: { thumbPath: `${AppConfig.AWS.BUCKET_BASE_URL}/${data.thumbPath}` }
        });

        return { data: true };
    }

    async UploadFile(
        file: Express.Multer.File,
        data: UploadFileRequestDTO,
        user: User
    ): Promise<UploadFinalizeMediaResponseDTO> {
        const extension = this._getMediaExtension(file.originalname);
        if (!this._allowedMediaExtensions[data.mediaType].includes(extension)) {
            throw new BadRequestException(ExceptionMessage.media.notSupported);
        }

        let sizeAllowed = file.size / 1024 <= this._allowedMediaSize[data.mediaType];
        if (!sizeAllowed) {
            throw new BadRequestException(ExceptionMessage.media.tooLarge);
        }

        const location = this._s3Service.CreateUniqueFilePath(file.originalname, data.mediaType);
        const path = `${AppConfig.AWS.BUCKET_BASE_URL}/${location}`;
        const uploadObjectData = {
            data: file.buffer,
            path: location,
            access:
                data.accessType === MediaAccess.PUBLIC
                    ? AccessType.PUBLIC_READ
                    : AccessType.PRIVATE,
            contentType: data.mediaType,
            fileName: file.originalname
        };
        await this._s3Service.Upload(uploadObjectData);
        const media = await this._dbService.media.create({
            data: {
                name: file.originalname,
                extension,
                location,
                path,
                thumbPath: path,
                type: data.mediaType,
                status: MediaStatus.READY,
                access: data.accessType,
                userId: user.id,
                size: file.size
            }
        });
        await this._s3Service.UpdateObjectIdTag(media.location, media.id);

        return media;
    }
}
