import { ApiProperty } from '@nestjs/swagger';
import { UserType } from '@prisma/client';
import { IsEmail, Length, IsEnum } from 'class-validator';
import { ToLowerCase, TrimString } from 'core/decorators/transform.decorator';

export default class LoginRequestDTO {
    @ApiProperty({ description: 'Email' })
    @IsEmail()
    @ToLowerCase()
    @TrimString()
    email: string;

    @ApiProperty({ description: 'Password' })
    @Length(1, 255)
    password: string;

    @ApiProperty({ enum: UserType })
    @IsEnum(UserType)
    type: UserType;
}
