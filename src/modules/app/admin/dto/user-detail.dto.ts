import { UserType } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsInt } from 'class-validator';

export class UserDetailDTO {
    @Type(() => Number)
    @IsInt({ message: 'userId must be an integer' })
    userId: number;

    @IsEnum(UserType, { message: 'user type must be ATHLETE or COACH' })
    userType: UserType;
}
