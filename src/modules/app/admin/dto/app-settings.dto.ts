import { IsEnum } from 'class-validator';

export enum AppSettingType {
    aboutApp = 'aboutApp',
    privacyPolicy = 'privacyPolicy',
    termsAndConditions = 'termsAndConditions'
}

export class AppSettingDTO {
    @IsEnum(AppSettingType, {
        message: 'type must be one of: aboutApp, privacyPolicy, termsAndConditions'
    })
    type: AppSettingType;
}
