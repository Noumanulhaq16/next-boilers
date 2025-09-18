import { ProfileUpdatedEmailPayload, TemplateLayoutParams } from '../types';

export default ({ userName }: ProfileUpdatedEmailPayload): TemplateLayoutParams => ({
    header: 'Profile Updated',
    body: `Dear ${userName}, 

    Your profile has been updated by the admin`
});
