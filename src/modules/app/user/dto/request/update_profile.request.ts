import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    ArrayMinSize,
    IsArray,
    IsBoolean,
    IsEmail,
    IsEnum,
    IsInt,
    IsNumber,
    Length,
    Matches,
    Max,
    Min,
    ValidateNested
} from 'class-validator';
import { phoneRegex, phoneRegexValidationMessage } from '../../../../../constants';
import { ToLowerCase, TrimString } from 'core/decorators/transform.decorator';
import { IsOptionalCustom } from 'core/decorators/validate.decorator';
import { Type } from 'class-transformer';
import { IsDate } from 'core/decorators';
import { AllowDateFormat } from 'helpers/date.helper';
import { SportGender, UserGender, UserGrade } from '@prisma/client';

class UpdateUserSportRequestDTO {
    @ApiProperty()
    @IsInt()
    sportId: number;

    @ApiProperty({ enum: SportGender, isArray: true })
    @IsArray()
    @IsEnum(SportGender, { each: true })
    sportGender: SportGender[];
}

class UpdateMediaSourceRequestDTO {
    @ApiProperty()
    @Length(1, 255)
    @TrimString()
    link: string;
}

class UpdateAchievementRequestDTO {
    @ApiProperty()
    @Length(1, 255)
    @TrimString()
    name: string;

    @ApiProperty()
    @IsInt()
    @Max(9999)
    year: number;
}
class UpdateWorkHistoryRequestDTO {
    @ApiProperty()
    @Length(1, 255)
    @TrimString()
    companyName: string;

    @ApiProperty()
    @IsInt()
    year: number;
}

class UpdateEducationHistoryRequestDTO {
    @ApiPropertyOptional()
    @IsOptionalCustom()
    @Length(1, 255)
    @TrimString()
    degree?: string;

    @ApiProperty()
    @Length(1, 255)
    @TrimString()
    institute: string;

    @ApiPropertyOptional()
    @IsOptionalCustom()
    @IsNumber({ maxDecimalPlaces: 2 })
    gpa?: number;

    @ApiPropertyOptional()
    @IsOptionalCustom()
    @Max(9999)
    @IsInt()
    year?: number;
}

export class UpdateCoachRequestDTO {
    @ApiPropertyOptional({ isArray: true, type: UpdateWorkHistoryRequestDTO })
    @IsOptionalCustom()
    @ValidateNested({ each: true })
    @Type(() => UpdateWorkHistoryRequestDTO)
    @IsArray()
    workHistory?: UpdateWorkHistoryRequestDTO[];

    @ApiPropertyOptional({ isArray: true, type: Number })
    @IsOptionalCustom()
    @IsArray()
    @ArrayMinSize(1)
    @IsNumber({}, { each: true })
    certificateIds?: number[];

    @ApiPropertyOptional()
    @IsOptionalCustom()
    @Length(1, 255)
    @TrimString()
    certification?: string;

    @ApiPropertyOptional()
    @IsOptionalCustom()
    @IsInt()
    coachingExperience?: number;

    @ApiPropertyOptional()
    @IsOptionalCustom()
    @Length(1, 255)
    @TrimString()
    sportPosition?: string;
}

export class UpdateAthleteRequestDTO {
    @ApiPropertyOptional({ isArray: true, type: UpdateAchievementRequestDTO })
    @IsOptionalCustom()
    @ValidateNested({ each: true })
    @Type(() => UpdateAchievementRequestDTO)
    @IsArray()
    achievements?: UpdateAchievementRequestDTO[];

    @ApiPropertyOptional({ isArray: true, type: UpdateMediaSourceRequestDTO })
    @IsOptionalCustom()
    @ValidateNested({ each: true })
    @Type(() => UpdateMediaSourceRequestDTO)
    @IsArray()
    externalMediaSources?: UpdateMediaSourceRequestDTO[];

    // @ApiPropertyOptional({ isArray: true, type: UpdateMediaSourceRequestDTO })
    // @ValidateNested({ each: true })
    @IsOptionalCustom()
    @Type(() => Array)
    @IsArray()
    DeletedexternalMediaSources?;

    @ApiPropertyOptional()
    @IsOptionalCustom()
    @Length(1, 255)
    @TrimString()
    currentTeam?: string;

    @ApiPropertyOptional()
    @IsOptionalCustom()
    @Length(1, 255)
    @TrimString()
    previousTeam?: string;

    @ApiPropertyOptional()
    @IsOptionalCustom()
    @Length(1, 255)
    @TrimString()
    coach?: string;

    @ApiPropertyOptional()
    @IsOptionalCustom()
    @Length(1, 255)
    @TrimString()
    sportPosition?: string;

    @ApiPropertyOptional({ enum: UserGrade })
    @IsOptionalCustom()
    @IsEnum(UserGrade)
    grade?: UserGrade;
}

export class UpdateUserRequestDTO {
    @ApiPropertyOptional()
    @IsOptionalCustom()
    @Length(1, 255)
    @TrimString()
    firstName?: string;

    @ApiPropertyOptional()
    @IsOptionalCustom()
    @Length(1, 255)
    @TrimString()
    lastName?: string;

    @ApiPropertyOptional()
    @IsOptionalCustom()
    @Length(1, 255)
    @TrimString()
    about?: string;

    @ApiPropertyOptional({ enum: UserGender })
    @IsOptionalCustom()
    @IsEnum(UserGender)
    gender?: UserGender;

    @ApiPropertyOptional()
    @IsOptionalCustom()
    @Length(1, 255)
    @TrimString()
    address?: string;

    @ApiPropertyOptional()
    @IsOptionalCustom()
    @Length(1, 255)
    @TrimString()
    country?: string;

    @ApiPropertyOptional()
    @IsOptionalCustom()
    @Length(1, 255)
    @TrimString()
    state: string;

    @ApiPropertyOptional()
    @IsOptionalCustom()
    @Length(1, 255)
    @TrimString()
    city?: string;

    @ApiPropertyOptional()
    @IsOptionalCustom()
    @Length(1, 255)
    @TrimString()
    zipCode?: string;

    @ApiPropertyOptional()
    @IsOptionalCustom()
    @IsNumber()
    longitude?: number;

    @ApiPropertyOptional()
    @IsOptionalCustom()
    @IsNumber()
    latitude?: number;

    @ApiPropertyOptional()
    @IsOptionalCustom()
    @IsInt()
    profilePictureId?: number;

    @ApiPropertyOptional()
    @IsOptionalCustom()
    @Matches(phoneRegex, {
        message: phoneRegexValidationMessage
    })
    phone?: string;

    @ApiPropertyOptional()
    @IsOptionalCustom()
    @IsInt()
    age?: number;

    @ApiProperty({ default: 70, description: 'in inches' })
    @IsOptionalCustom()
    @IsNumber({ maxDecimalPlaces: 1 })
    @Min(1)
    height?: number;

    @ApiProperty({ default: 70, description: 'in pounds' })
    @IsOptionalCustom()
    @IsNumber({ maxDecimalPlaces: 1 })
    @Min(1)
    weight?: number;

    @ApiPropertyOptional()
    @IsOptionalCustom()
    @ValidateNested({ each: true })
    @Type(() => UpdateAthleteRequestDTO)
    athleteDetails?: UpdateAthleteRequestDTO;

    @ApiPropertyOptional({ type: UpdateCoachRequestDTO })
    @IsOptionalCustom()
    @ValidateNested({ each: true })
    @Type(() => UpdateCoachRequestDTO)
    coachDetails?: UpdateCoachRequestDTO;

    @ApiPropertyOptional({ isArray: true, type: UpdateUserSportRequestDTO })
    @IsOptionalCustom()
    @ValidateNested({ each: true })
    @Type(() => UpdateUserSportRequestDTO)
    @IsArray()
    sports?: UpdateUserSportRequestDTO[];

    @ApiPropertyOptional({ isArray: true, type: UpdateEducationHistoryRequestDTO })
    @IsOptionalCustom()
    @ValidateNested({ each: true })
    @Type(() => UpdateEducationHistoryRequestDTO)
    @IsArray()
    educationHistory?: UpdateEducationHistoryRequestDTO[];

    @ApiPropertyOptional({ default: false })
    @IsOptionalCustom()
    @IsBoolean()
    sendForApproval?: boolean;
}
