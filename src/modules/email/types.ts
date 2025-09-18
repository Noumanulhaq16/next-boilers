import { UserType } from '@prisma/client';

export type WelcomeEmailPayload = {
    name: string;
    link: string;
};

export enum SendEmailProviderType {
    AWS_SES = 'AWS_SES',
    SENDGRID = 'SENDGRID'
}

export type TemplateLayoutParams = {
    header: string;
    body: string;
};

export type UserRegistrationEmailPayload = {
    user: { name: string; type: UserType };
};
export type UserRegistrationRequestEmailPayload = {
    user: { id: number; name: string };
};
export type UserVerificationEmailPayload = {
    otp: string;
};
export type ForgotPasswordEmailPayload = {
    userName: string;
    otp: string;
};
export type ResetPasswordEmailPayload = {
    user: { name: string; type: UserType };
};
export type ProfileUpdatedEmailPayload = {
    userName: string;
};
export type AccountBlockedEmailPayload = {
    userName: string;
};
