import { ApiPropertyOptional } from '@nestjs/swagger';
import { UserStatus, UserType } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsArray, IsBoolean, IsEnum, IsInt, IsString, NotEquals } from 'class-validator';
import { ParseToBoolean, ParseToInt, TrimString } from 'core/decorators/transform.decorator';
import { IsOptionalCustom } from 'core/decorators/validate.decorator';
import SearchableRequest from 'core/request/searchable.request';

export default class FindUsersRequestDTO extends SearchableRequest {
    @ApiPropertyOptional({ enum: UserType })
    @IsOptionalCustom()
    @IsEnum(UserType)
    @NotEquals(UserType.ADMIN)
    type?: UserType;

    @ApiPropertyOptional({ isArray: true, type: UserStatus })
    @IsOptionalCustom()
    @Transform(({ value }) => (Array.isArray(value) ? value.map((item) => item) : [value]))
    @IsArray()
    @IsEnum(UserStatus, { each: true })
    status?: UserStatus[];

    @ApiPropertyOptional({
        description: 'true = liked, false = disliked, undefined = all except disliked'
    })
    @IsOptionalCustom()
    @IsBoolean()
    @ParseToBoolean()
    isFavorite?: boolean;

    @ApiPropertyOptional({
        description: 'true = liked, false = disliked,'
    })
    @IsOptionalCustom()
    @IsBoolean()
    @ParseToBoolean()
    meAsFavorite?: boolean;

    @ApiPropertyOptional()
    @IsOptionalCustom()
    @IsString()
    @TrimString()
    sportName?: string;

    @ApiPropertyOptional()
    @IsOptionalCustom()
    @IsString()
    @TrimString()
    schoolName?: string;

    @ApiPropertyOptional()
    @IsOptionalCustom()
    @IsString()
    @TrimString()
    address?: string;

    @ApiPropertyOptional()
    @IsOptionalCustom()
    @IsInt()
    @ParseToInt()
    coachingExperience?: number;

    @ApiPropertyOptional()
    @IsOptionalCustom()
    @ParseToInt()
    @IsInt()
    subscriptionPlanId?: number;
}
