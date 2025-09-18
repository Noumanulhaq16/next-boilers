import { ApiProperty } from '@nestjs/swagger';

export class AnalyticsResponseModel {
    @ApiProperty()
    count: number;
}

export class AnalyticsResponseDTO {
    @ApiProperty()
    '2024-01': AnalyticsResponseModel;

    @ApiProperty()
    '2024-02': AnalyticsResponseModel;

    @ApiProperty()
    '2024-03': AnalyticsResponseModel;

    @ApiProperty()
    '2024-04': AnalyticsResponseModel;

    @ApiProperty()
    '2024-05': AnalyticsResponseModel;

    @ApiProperty()
    '2024-06': AnalyticsResponseModel;

    @ApiProperty()
    '2024-07': AnalyticsResponseModel;

    @ApiProperty()
    '2024-08': AnalyticsResponseModel;

    @ApiProperty()
    '2024-09': AnalyticsResponseModel;

    @ApiProperty()
    '2024-10': AnalyticsResponseModel;

    @ApiProperty()
    '2024-11': AnalyticsResponseModel;

    @ApiProperty()
    '2024-12': AnalyticsResponseModel;
}
