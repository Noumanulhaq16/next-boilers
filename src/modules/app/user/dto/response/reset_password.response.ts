import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordResponseDTO {
    @ApiProperty()
    token: string;
}
