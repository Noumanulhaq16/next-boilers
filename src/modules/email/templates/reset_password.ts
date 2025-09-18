import { ResetPasswordEmailPayload, TemplateLayoutParams } from '../types';
import { genButton, genText } from './layout';

export default ({ user }: ResetPasswordEmailPayload): TemplateLayoutParams => ({
    header: 'ATHLINC - Password Updated',
    body: `${
        genText(`Dear User!
    Your ATHLINC account password has been updated recently. If it wasn’t you, kindly try logging in to the dashboard or update the password.`) +
        genButton({ title: 'Login Now', url: '' })
    }`
});
