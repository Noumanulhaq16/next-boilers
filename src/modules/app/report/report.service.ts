import { Injectable } from '@nestjs/common';
import { MediaStatus, MediaType, Prisma, ReportType, User, UserStatus } from '@prisma/client';
import { ExceptionMessage } from '../../../constants';
import {
    BadRequestException,
    FatalErrorException,
    NotFoundException
} from 'core/exceptions/response.exception';
import { BooleanResponseDTO } from 'core/response/response.schema';
import DatabaseService from 'database/database.service';
import { GetOrderOptions, GetPaginationOptions } from 'helpers/util.helper';
import { CreateReportRequestDTO } from './dto/request/create.request';
import { FindReportsRequestDTO } from './dto/request/find.request';
import { FindReportsResponseDTO } from './dto/response/find.response';
import { Logger } from 'helpers/logger.helper';

@Injectable()
export default class ReportService {
    constructor(private _dbService: DatabaseService) {}

    async CreateReport(data: CreateReportRequestDTO, user: User): Promise<BooleanResponseDTO> {
        const reportCreateData: Prisma.XOR<
            Prisma.ReportCreateInput,
            Prisma.ReportUncheckedCreateInput
        > = {
            ...(data.title && { title: data.title }),
            ...(data.description && { description: data.description }),
            reporterId: user.id,
            type: ReportType.GENERAL,
            reason: data.reason
        };

        if (data.mediaIds?.length) {
            const mediaCount = await this._dbService.media.count({
                where: {
                    id: {
                        in: data.mediaIds
                    },
                    userId: user.id,
                    status: MediaStatus.READY,
                    type: { in: [MediaType.IMAGE] }
                }
            });
            if (mediaCount !== data.mediaIds.length) {
                throw new NotFoundException(ExceptionMessage.media.notFound);
            }
            reportCreateData.medias = {
                createMany: {
                    data: data.mediaIds.map((mediaId) => ({
                        mediaId: mediaId
                    }))
                }
            };
        }

        if (data.userId) {
            const reportedUser = await this._dbService.user.findFirst({
                where: { id: data.userId, status: UserStatus.ACTIVE },
                select: { id: true }
            });
            if (!reportedUser) {
                throw new NotFoundException(ExceptionMessage.user.notFound);
            }
            const existingReport = await this._dbService.report.findFirst({
                where: {
                    type: ReportType.USER,
                    reporterId: user.id,
                    reportedUserId: reportedUser.id
                },
                select: { id: true }
            });
            if (existingReport) {
                throw new BadRequestException(ExceptionMessage.report.alreadyExist);
            }
            reportCreateData.type = ReportType.USER;
            reportCreateData.reportedUserId = reportedUser.id;
        }

        const report = await this._dbService.report.create({
            data: reportCreateData,
            include: {
                reporter: true
            }
        });

        return {
            data: true
        };
    }

    async FindReports(data: FindReportsRequestDTO): Promise<FindReportsResponseDTO> {
        const whereParams: Prisma.ReportWhereInput = {
            ...(data.type && { type: data.type })
        };
        if (data.search) {
            whereParams.AND = {
                reporter: {
                    firstName: {
                        contains: data.search,
                        mode: 'insensitive'
                    }
                }
            };
        }
        const pagination = GetPaginationOptions(data);
        const order = GetOrderOptions(data);
        const reports = await this._dbService.report.findMany({
            where: whereParams,
            include: {
                reporter: {
                    select: {
                        id: true,
                        firstName: true,
                        email: true,
                        type: true,
                        status: true
                    }
                },
                reportedUser: {
                    select: {
                        id: true,
                        firstName: true,
                        email: true,
                        type: true,
                        status: true
                    }
                },
                medias: {
                    where: { deletedAt: null },
                    select: {
                        id: true,
                        reportId: true,
                        mediaId: true,
                        media: { select: { id: true, path: true, thumbPath: true, type: true } }
                    }
                }
            },
            ...pagination,
            orderBy: order
        });

        const count = await this._dbService.report.count({
            where: whereParams
        });
        return {
            data: reports,
            count
        };
    }

    async DeleteReport(id: number): Promise<BooleanResponseDTO> {
        const report = await this._dbService.report.findFirst({
            where: {
                id
            },
            select: { id: true, medias: { where: { deletedAt: null }, select: { mediaId: true } } }
        });
        if (!report) {
            throw new NotFoundException(ExceptionMessage.report.notFound);
        }
        const reportMediaIds = report.medias.map((reportMedia) => reportMedia.mediaId);
        const prismaQueries: Array<Prisma.PrismaPromise<any>> = [];
        prismaQueries.push(this._dbService.report.delete({ where: { id: report.id } }));
        if (reportMediaIds?.length) {
            prismaQueries.push(
                this._dbService.media.updateMany({
                    where: { id: { in: reportMediaIds } },
                    data: { status: MediaStatus.STALE }
                })
            );
        }
        //TODO: Handle Stale Media
        try {
            await this._dbService.$transaction(prismaQueries);
        } catch (err) {
            Logger.Error(err, '[REPORT]');
            throw new FatalErrorException(ExceptionMessage.report.unknownError);
        }
        return {
            data: true
        };
    }
}
