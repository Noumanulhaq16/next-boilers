import AppConfig from 'configs/app.config';
import { UserRegistrationRequestEmailPayload } from '../types';
import { genLink, genText } from './layout';

export default ({ user }: UserRegistrationRequestEmailPayload) => ({
    header: 'ATHLINC - New Sub’s Request',
    body: `${
        genText(
            `You have a new sub request who wants to be a part of ATHLINC community. Click the link below to see the new sub’s details. `
        ) +
        genLink({
            title: 'Check details now!',
            url: ``
        })
    }`
});
