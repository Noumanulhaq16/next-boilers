import { NotificationType, UserType } from '@prisma/client';
import { UserResponseModel } from 'modules/app/user/dto/response/model';
import { EmailTemplates } from '../../constants';

export enum SQSMessageType {
    EMAIL = 'EMAIL',
    NOTIFICATION = 'NOTIFICATION'
}

export type SQSMessagePayload<T> = {
    type: SQSMessageType;
    payload: T;
};

export type SQSSendEmailArgs<T> = {
    template: EmailTemplates;
    subject: string;
    emails: string[];
    data: T;
};

export type SQSSendNotificationArgs<T = void> = {
    type: NotificationType;
    initiatorId: number;
    initiator?: Partial<UserResponseModel>;
    receivers: {
        id: number;
        meta?: T extends void ? any : T;
    }[];
    receiverType: UserType;
    meta?: T extends void
        ? {
              user?: Partial<UserResponseModel>;
          }
        : T;
};
