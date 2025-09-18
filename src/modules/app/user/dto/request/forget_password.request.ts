import { ApiProperty } from '@nestjs/swagger';
import { UserType } from '@prisma/client';
import { IsEmail, IsEnum, IsString, IsUUID, Length } from 'class-validator';
import { ToLowerCase } from 'core/decorators/transform.decorator';

export class ForgetPasswordRequestDTO {
    @ApiProperty()
    @IsEmail()
    @ToLowerCase()
    email: string;

    @ApiProperty({ enum: UserType })
    @IsEnum(UserType)
    type: UserType;
}

export class ForgetPasswordVerificationRequestDTO {
    @ApiProperty()
    @IsUUID('4')
    token: string;

    @ApiProperty()
    @IsString()
    @Length(6, 6)
    code: string;
}
