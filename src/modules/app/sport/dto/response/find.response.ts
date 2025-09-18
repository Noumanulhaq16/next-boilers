import { ApiProperty } from '@nestjs/swagger';
import { SportResponseModel } from './model';

export class FindSportsResponseDTO {
    @ApiProperty({ isArray: true, type: SportResponseModel })
    data: SportResponseModel[];

    @ApiProperty()
    count: number;
}
