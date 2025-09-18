import { UserResponseModel } from './dto/response/model';

export type UserRegistrationEventParams = {
    user: Pick<UserResponseModel, 'id' | 'firstName' | 'type' | 'email'>;
};

export type TUserMeta = {
    statusReason?: string;
};
