import { TemplateLayoutParams, UserVerificationEmailPayload } from '../types';
import { genText } from './layout';

export default ({ otp }: UserVerificationEmailPayload): TemplateLayoutParams => ({
    header: `ATHLINC - OTP`,
    body: `${genText(`Your 4-digit OTP is ${otp}. 
    Enter this OTP in the application to verify your identity.`)}`
});
