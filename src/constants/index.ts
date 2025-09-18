export { ExceptionMessage } from './exceptionMessages';
export { SocketRoomType, SocketEventType } from './socket';

export enum EmailTemplates {
    WELCOME = 'WELCOME',
    USER_REGISTRATION = 'USER_REGISTRATION',
    USER_REGISTRATION_REQUEST = 'USER_REGISTRATION_REQUEST',
    USER_VERIFICATION = 'USER_VERIFICATION',
    FORGOT_PASSWORD = 'FORGOT_PASSWORD',
    RESET_PASSWORD = 'RESET_PASSWORD',
    ACCOUNT_BLOCKED = 'ACCOUNT_BLOCKED'
}

export enum EventType {
    USER_REGISTRATION = 'USER_REGISTRATION',
    USER_REGISTRATION_REQUEST = 'USER_REGISTRATION_REQUEST',
    UNSUBSCRIBE_USERS = 'UNSUBSCRIBE_USERS'
}

export const TOKEN_EXPIRATION_THRESHOLD_TIME = 24; //HOURS
export const SET_TO_NOTHING = '-1';
export const phoneRegex = /^(?:00|\+)[0-9\s.\/-]{6,20}$/;
export const phoneRegexValidationMessage =
    'phone must start with 00 or + followed by the country code';
