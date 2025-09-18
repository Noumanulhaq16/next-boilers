import { ApiProperty, OmitType } from '@nestjs/swagger';
import { UserType } from '@prisma/client';
import { IsEmail, IsEnum, IsString, IsUUID, Length, NotEquals } from 'class-validator';
import { ToLowerCase, TrimString } from 'core/decorators/transform.decorator';

export class SignupRequestDTO {
    @ApiProperty()
    @IsEmail()
    @ToLowerCase()
    @TrimString()
    email: string;

    @ApiProperty()
    @IsString()
    @TrimString()
    @Length(6, 128)
    password: string;

    @ApiProperty({ enum: UserType })
    @IsEnum(UserType)
    @NotEquals(UserType.ADMIN)
    userType: UserType;
}

export class SignupVerificationRequestDTO extends OmitType(SignupRequestDTO, ['email']) {
    @ApiProperty()
    @IsUUID('4')
    token: string;

    @ApiProperty()
    @IsString()
    @Length(6, 6)
    code: string;
}
