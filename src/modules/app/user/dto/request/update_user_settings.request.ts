import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';
import { ParseToBoolean } from 'core/decorators/transform.decorator';
import { IsOptionalCustom } from 'core/decorators/validate.decorator';

export class UpdateUserSettingsRequestDTO {
    @ApiPropertyOptional()
    @IsBoolean()
    @IsOptionalCustom()
    @ParseToBoolean()
    notificationsEnabled?: boolean;
}
