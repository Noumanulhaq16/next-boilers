import { ApiProperty } from '@nestjs/swagger';

class CitiesModel {
    @ApiProperty()
    id: number;

    @ApiProperty()
    name: string;
}
export class CitiesResponseDTO {
    @ApiProperty({ isArray: true, type: CitiesModel })
    data: CitiesModel[];

    @ApiProperty()
    count: number;
}
