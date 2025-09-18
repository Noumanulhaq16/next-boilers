import { Body, Param, ParseIntPipe, Query } from '@nestjs/common';
import { User, UserType } from '@prisma/client';
import { ApiController, Authorized, CurrentUser, Delete, Get, Post } from 'core/decorators';
import { BooleanResponseDTO } from 'core/response/response.schema';
import { CreateReportRequestDTO } from './dto/request/create.request';
import { FindReportsRequestDTO } from './dto/request/find.request';
import { FindReportsResponseDTO } from './dto/response/find.response';
import ReportService from './report.service';

@ApiController({
    path: '/reports',
    tag: 'report',
    version: '1'
})
export default class ReportController {
    constructor(private _reportService: ReportService) {}

    @Authorized([UserType.ATHLETE, UserType.COACH])
    @Post({
        path: '/',
        description: 'Create Report',
        response: BooleanResponseDTO
    })
    CreateReport(
        @Body() data: CreateReportRequestDTO,
        @CurrentUser() user: User
    ): Promise<BooleanResponseDTO> {
        return this._reportService.CreateReport(data, user);
    }

    @Authorized([UserType.ADMIN])
    @Get({
        path: '/',
        description: 'Find Reports',
        response: FindReportsResponseDTO
    })
    FindReports(@Query() data: FindReportsRequestDTO): Promise<FindReportsResponseDTO> {
        return this._reportService.FindReports(data);
    }

    @Authorized([UserType.ADMIN])
    @Delete({
        path: '/:id',
        description: 'Delete Report',
        response: BooleanResponseDTO
    })
    DeleteReport(@Param('id', ParseIntPipe) id: number): Promise<BooleanResponseDTO> {
        return this._reportService.DeleteReport(id);
    }
}
