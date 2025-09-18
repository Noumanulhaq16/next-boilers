import { ForgotPasswordEmailPayload, TemplateLayoutParams } from '../types';
import { genText } from './layout';

export default ({ userName, otp }: ForgotPasswordEmailPayload): TemplateLayoutParams => ({
    header: `ATHLINC - OTP`,
    body: `${genText(`Your 4-digit OTP is ${otp}. 
    Enter this OTP in the application to reset your password.`)}`
});
