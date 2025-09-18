import { TemplateLayoutParams, UserRegistrationEmailPayload } from '../types';
import { genText } from './layout';

export default ({ user }: UserRegistrationEmailPayload): TemplateLayoutParams => ({
    header: 'Welcome to ATHLINC Community',
    body: `${genText(`Dear ${user.name},

    We are delighted to welcome you to ATHLINC App! Thank you for joining our community and choosing our application.
    
  `)}`
});
