import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SportGender, SportType } from '@prisma/client';

export class SportResponseModel {
    @ApiProperty()
    id: number;

    @ApiProperty()
    title: string;

    @ApiProperty({ enum: SportType })
    type: SportType;

    @ApiProperty({ enum: SportGender, isArray: true })
    sportGender: SportGender[];
}

export class UserSportResponseModel {
    @ApiProperty()
    id: number;

    @ApiProperty()
    sportId: number;

    @ApiProperty()
    userId: number;

    @ApiProperty({ enum: SportGender, isArray: true })
    sportGender: SportGender[];

    @ApiPropertyOptional({ type: SportResponseModel })
    sport?: Partial<SportResponseModel>;
}
