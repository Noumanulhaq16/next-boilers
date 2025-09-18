import { ApiProperty } from '@nestjs/swagger';
import { TokenReason } from '@prisma/client';
import { IsEnum, IsInt, IsString, IsUUID, Length } from 'class-validator';
import { TTokenMeta } from '../../types';

export default class CreatePasswordTokenRequestDTO {
    @ApiProperty({ enum: TokenReason })
    @IsEnum(TokenReason)
    reason: TokenReason;

    @ApiProperty()
    @IsUUID('4')
    uuid: string;

    @ApiProperty()
    @IsInt()
    userId?: number;

    @ApiProperty()
    @IsString()
    @Length(4, 4)
    code?: string;

    @ApiProperty()
    meta?: TTokenMeta;
}
