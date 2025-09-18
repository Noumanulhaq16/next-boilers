import { AccountBlockedEmailPayload, TemplateLayoutParams } from '../types';

export default ({ userName }: AccountBlockedEmailPayload): TemplateLayoutParams => ({
    header: 'Account Blocked',
    body: `Dear ${userName}, 

    We regret to inform you that your account has been blocked temporarily.
    
    Please contact the admin for further assistance regarding this issue.`
});
