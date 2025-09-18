import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, Length, IsBoolean, IsOptional } from 'class-validator';
import { ParseToBoolean } from 'core/decorators/transform.decorator';

export class UserInteractionsDTO {
    @ApiProperty()
    @IsBoolean()
    @ParseToBoolean()
    @IsOptional()
    isFavourite?: Boolean;

    @ApiProperty()
    @IsBoolean()
    @ParseToBoolean()
    @IsOptional()
    meAsFavourite?: Boolean;

    @ApiProperty()
    @IsBoolean()
    @ParseToBoolean()
    @IsOptional()
    dislike?: Boolean;
}
