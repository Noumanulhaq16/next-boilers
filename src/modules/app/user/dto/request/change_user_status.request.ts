import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserStatus } from '@prisma/client';
import { IsEnum, IsString, Length } from 'class-validator';
import { TrimString } from 'core/decorators';
import { IsOptionalCustom } from 'core/decorators/validate.decorator';

export class ChangeUserStatusRequestDTO {
    @ApiProperty({
        enum: UserStatus
    })
    @IsEnum(UserStatus)
    status: UserStatus;

    @ApiPropertyOptional()
    @IsOptionalCustom()
    @IsString()
    @TrimString()
    @Length(1)
    reason?: string;
}
