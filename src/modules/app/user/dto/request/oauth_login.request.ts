import { ApiProperty } from '@nestjs/swagger';
import { UserOAuthType, UserType } from '@prisma/client';
import { IsEnum, IsOptional, IsString, NotEquals } from 'class-validator';

export default class OAuthLoginRequestDTO {
    @ApiProperty()
    @IsString()
    providerId: string;

    @ApiProperty({ enum: UserOAuthType })
    @IsEnum(UserOAuthType)
    providerType: UserOAuthType;

    @ApiProperty({ enum: UserType })
    @IsEnum(UserType)
    @NotEquals(UserType.ADMIN)
    userType: UserType;

    @ApiProperty({ required: false, nullable: true })
    @IsOptional()
    @IsString()
    profilePicture?: string | null;
}
