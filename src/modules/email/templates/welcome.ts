import { TemplateLayoutParams, WelcomeEmailPayload } from '../types';

export default ({ name, link }: WelcomeEmailPayload): TemplateLayoutParams => {
    return { header: 'Welcome', body: `Welcome ${name}` };
};
