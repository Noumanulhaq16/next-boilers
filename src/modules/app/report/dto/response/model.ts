import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReportReason, ReportType } from '@prisma/client';
import { MediaResponseModel } from 'modules/app/media/dto/response/model';
import { UserResponseModel } from 'modules/app/user/dto/response/model';

class ReportMediaResponseModel {
    @ApiProperty()
    id: number;

    @ApiPropertyOptional()
    reportId?: number;

    @ApiPropertyOptional()
    mediaId?: number;

    @ApiProperty({ type: MediaResponseModel })
    media?: MediaResponseModel;
}

export class ReportResponseModel {
    @ApiProperty()
    id: number;

    @ApiProperty()
    title: string;

    @ApiProperty()
    description: string;

    @ApiProperty({ enum: ReportType })
    type: ReportType;

    @ApiProperty({ enum: ReportReason })
    reason: ReportReason;

    @ApiProperty()
    reporterId: number;

    @ApiProperty()
    reporter: Partial<UserResponseModel>;

    @ApiPropertyOptional()
    reportedUserId: number;

    @ApiPropertyOptional()
    reportedUser: Partial<UserResponseModel>;

    @ApiPropertyOptional({ isArray: true, type: ReportMediaResponseModel })
    medias?: ReportMediaResponseModel[];
}
