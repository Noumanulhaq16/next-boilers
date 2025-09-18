import { IsOptional, IsString } from 'class-validator';
import { AppSettingDTO } from './app-settings.dto';

export class UpdateAppSettingsDTO extends AppSettingDTO {
    @IsOptional()
    data?: string;
}
