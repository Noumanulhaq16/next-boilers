import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserGender, UserGrade, UserStatus, UserType } from '@prisma/client';
import { MediaResponseModel } from 'modules/app/media/dto/response/model';
import { UserSettingsModel } from './model_user_settings';
import { UserSportResponseModel } from 'modules/app/sport/dto/response/model';
import { UserSubscriptionResponseModel } from 'modules/app/subscription/dto/response/model';

class UserInfoModel {
    @ApiProperty()
    currentTeam: string;

    @ApiProperty()
    previousTeam: string;

    @ApiProperty()
    coach: string;

    @ApiProperty()
    certification: string;

    @ApiProperty()
    sportPosition: string;

    @ApiProperty()
    coachingExperience: number;

    @ApiProperty({ enum: UserGrade })
    grade: UserGrade;
}

class ExternalMediaSourceModel {
    @ApiProperty()
    id: number;

    @ApiProperty()
    link: string;

    @ApiProperty()
    userId: number;
}

class CertificateResponseModel {
    @ApiProperty()
    id: number;

    @ApiPropertyOptional()
    userId?: number;

    @ApiPropertyOptional()
    mediaId?: number;

    @ApiProperty({ type: MediaResponseModel })
    media?: MediaResponseModel;
}

class AchievementModel {
    @ApiProperty()
    id: number;

    @ApiProperty()
    name: string;

    @ApiProperty()
    year: number;

    @ApiProperty()
    userId: number;
}
class WorkHistoryModel {
    @ApiProperty()
    id: number;

    @ApiProperty()
    companyName: string;

    @ApiProperty()
    year: number;

    @ApiProperty()
    userId: number;
}
class EducationHistoryModel {
    @ApiProperty()
    id: number;

    @ApiProperty()
    degree: string;

    @ApiProperty()
    institute: string;

    @ApiProperty()
    gpa: number;

    @ApiProperty()
    year: number;

    @ApiProperty()
    userId: number;
}

class AddressInfoModel {
    @ApiProperty()
    address: string;

    @ApiProperty()
    country: string;

    @ApiProperty()
    city: string;

    @ApiProperty()
    state: string;

    @ApiProperty()
    zipCode: string;
}

export class UserResponseModel {
    @ApiProperty()
    id: number;

    @ApiProperty()
    firstName: string;

    @ApiProperty()
    lastName: string;

    @ApiProperty({ enum: UserType })
    type: UserType;

    @ApiProperty()
    email: string;

    @ApiProperty()
    phone: string;

    @ApiProperty()
    age?: number;

    @ApiProperty({ enum: UserStatus })
    status: UserStatus;

    @ApiPropertyOptional({ enum: UserGender })
    gender: UserGender | null;

    @ApiProperty()
    height: number;

    @ApiProperty()
    weight: number;

    @ApiProperty()
    about: string;

    @ApiProperty()
    profilePictureId: number;

    @ApiProperty()
    isOnline: boolean;

    @ApiProperty()
    lastSeenAt: Date;

    @ApiProperty()
    profilePicture?: MediaResponseModel;

    @ApiProperty()
    settings?: UserSettingsModel;

    @ApiProperty()
    addressInfo?: AddressInfoModel;

    @ApiProperty()
    userInfo?: UserInfoModel;

    @ApiProperty({ isArray: true, type: EducationHistoryModel })
    educationHistories?: EducationHistoryModel[];

    @ApiProperty({ isArray: true, type: WorkHistoryModel })
    workHistories?: WorkHistoryModel[];

    @ApiProperty({ isArray: true, type: AchievementModel })
    achievements?: AchievementModel[];

    @ApiProperty({ isArray: true, type: CertificateResponseModel })
    certificates?: CertificateResponseModel[];

    @ApiProperty({ isArray: true, type: ExternalMediaSourceModel })
    externalMediaSources?: ExternalMediaSourceModel[];

    @ApiProperty({ isArray: true, type: UserSportResponseModel })
    userSports?: UserSportResponseModel[];

    @ApiPropertyOptional({ description: 'number of users who liked me' })
    totalLikes?: number;

    @ApiProperty()
    userSubscription?: UserSubscriptionResponseModel;
}

export class UserDetailsResponseModel extends UserResponseModel {
    @ApiPropertyOptional()
    isLiked?: boolean;

    @ApiPropertyOptional()
    isDisliked?: boolean;
}
