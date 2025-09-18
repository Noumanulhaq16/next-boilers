import { UserType } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class ListUsersDTO {
    @IsEnum(UserType, { message: 'type must be one of: ATHLETE, COACH, ADMIN' })
    type: UserType;
}
