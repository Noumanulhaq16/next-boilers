import { User, UserType } from '@prisma/client';
import { IsEnum, IsInt } from 'class-validator';

export class BlockUserDto {
    @IsInt({ message: 'userId must be an integer' })
    userId: number;

    @IsEnum(UserType, { message: 'user type must be ATHLETE or COACH' })
    type: UserType;
}
