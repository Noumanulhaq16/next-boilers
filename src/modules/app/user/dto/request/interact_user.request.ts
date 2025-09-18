import { ApiProperty } from '@nestjs/swagger';
import { UserInteractionType } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class InteractUserRequestDTO {
    @ApiProperty({ enum: UserInteractionType })
    @IsEnum(UserInteractionType)
    type: UserInteractionType;
}
