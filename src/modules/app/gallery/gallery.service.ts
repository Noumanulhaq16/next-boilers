import { Injectable } from '@nestjs/common';
import { MediaStatus, MediaType, Prisma, User } from '@prisma/client';
import { BooleanResponseDTO } from 'core/response/response.schema';
import DatabaseService from 'database/database.service';
import { ChangeGalleryMediaRequestDTO } from './dto/request/change.request';
import { NotFoundException } from 'core/exceptions/response.exception';
import { ExceptionMessage } from '../../../constants';
import { FindGalleryMediaRequestDTO } from './dto/request/find.request';
import { FindGalleryMediaResponseDTO } from './dto/response/find.response';
import { GetOrderOptions, GetPaginationOptions } from 'helpers/util.helper';

@Injectable()
export default class GalleryService {
    constructor(private _dbService: DatabaseService) {}

    async ChangeGalleryMedia(
        data: ChangeGalleryMediaRequestDTO,
        user: User
    ): Promise<BooleanResponseDTO> {
        if (!(data.createIds?.length || data.deleteIds?.length)) {
            return { data: true };
        }
        const mediaCount = await this._dbService.media.count({
            where: {
                id: {
                    in: [
                        ...(data.createIds?.length ? data.createIds : []),
                        ...(data.deleteIds?.length ? data.deleteIds : [])
                    ]
                },
                userId: user.id,
                status: MediaStatus.READY,
                type: { in: [MediaType.VIDEO, MediaType.IMAGE] }
            }
        });
        if (mediaCount !== (data.createIds?.length || 0) + (data.deleteIds?.length || 0)) {
            throw new NotFoundException(ExceptionMessage.media.notFound);
        }

        const prismaQueries: Prisma.PrismaPromise<any>[] = [];
        if (data.createIds?.length) {
            prismaQueries.push(
                this._dbService.galleryMedia.createMany({
                    data: data.createIds.map((item) => ({
                        featured: !!data.featured,
                        userId: user.id,
                        mediaId: item
                    }))
                })
            );
        }

        if (data.deleteIds?.length) {
            prismaQueries.push(
                this._dbService.galleryMedia.deleteMany({
                    where: {
                        mediaId: {
                            in: data.deleteIds
                        }
                    }
                })
            );
            prismaQueries.push(
                this._dbService.media.updateMany({
                    where: {
                        id: {
                            in: data.deleteIds
                        }
                    },
                    data: { status: MediaStatus.STALE }
                })
            );
            //TODO: Handle Stale Media
        }
        await this._dbService.$transaction(prismaQueries);
        return { data: true };
    }

    async Find(
        data: FindGalleryMediaRequestDTO,
        currentUser: User
    ): Promise<FindGalleryMediaResponseDTO> {
        const whereParams: Prisma.GalleryMediaWhereInput = {
            ...(data.featured && { featured: data.featured }),
            ...(data.mediaType?.length && { media: { type: { in: data.mediaType } } }),
            userId: data.userId
        };

        const pagination = GetPaginationOptions(data);
        const order = GetOrderOptions(data);

        const galleryMedia = await this._dbService.galleryMedia.findMany({
            where: whereParams,
            include: { media: { select: { id: true, path: true, thumbPath: true, type: true } } },
            ...pagination,
            orderBy: order
        });
        const count = await this._dbService.galleryMedia.count({
            where: whereParams
        });

        return { data: galleryMedia, count };
    }
}
