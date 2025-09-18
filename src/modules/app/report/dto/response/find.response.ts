import { ApiProperty } from '@nestjs/swagger';
import { ReportResponseModel } from './model';

export class FindReportsResponseDTO {
    @ApiProperty({ isArray: true, type: ReportResponseModel })
    data: ReportResponseModel[];

    @ApiProperty()
    count: number;
}
