import { SendEmailCommand, SESClient } from '@aws-sdk/client-ses';
import { MailService } from '@sendgrid/mail';
import { MailDataRequired } from '@sendgrid/helpers/classes/mail';
import { Injectable } from '@nestjs/common';
import AppConfig from 'configs/app.config';
import { EmailTemplates } from '../../constants';
import { Logger } from 'helpers/logger.helper';
import { SendEmailProviderType, TemplateLayoutParams } from './types';
import { SQSSendEmailArgs } from 'modules/queue/types';

/* Import email templates here */
import GenerateTemplate from './templates/layout';
import WelcomeTemplate from './templates/welcome';
import UserRegistrationTemplate from './templates/user_registration';
import ForgotPasswordTemplate from './templates/forgot_password';
import ResetPasswordTemplate from './templates/reset_password';
import AccountBlockedTemplate from './templates/account_blocked';
import UserVerificationTemplate from './templates/user_verification';

const TEMPLATES: Readonly<{ [key in EmailTemplates]: (data: any) => TemplateLayoutParams }> = {
    WELCOME: WelcomeTemplate,
    USER_REGISTRATION: UserRegistrationTemplate,
    USER_REGISTRATION_REQUEST: UserRegistrationTemplate,
    USER_VERIFICATION: UserVerificationTemplate,
    FORGOT_PASSWORD: ForgotPasswordTemplate,
    RESET_PASSWORD: ResetPasswordTemplate,
    ACCOUNT_BLOCKED: AccountBlockedTemplate
};

type SendEMailType = {
    [key in keyof typeof SendEmailProviderType]: (data: SQSSendEmailArgs<any>) => void;
};

@Injectable()
export default class EmailService {
    private _sesClient: SESClient = null;
    private _sendGridMailClient: MailService = null;
    private _sendWith: SendEMailType = null;

    constructor() {
        this._sesClient = new SESClient({
            credentials: {
                accessKeyId: AppConfig.AWS.ACCESS_KEY,
                secretAccessKey: AppConfig.AWS.SECRET_KEY
            },
            region: AppConfig.AWS.REGION
        });

        this._sendGridMailClient = new MailService();
        this._sendGridMailClient.setApiKey(AppConfig.SENDGRID.API_KEY);

        this._sendWith = {
            AWS_SES: (args) => this._sendWithSES(args),
            SENDGRID: (args) => this._sendWithSendGrid(args)
        };
    }

    private async _sendWithSES(args: SQSSendEmailArgs<any>) {
        const command = new SendEmailCommand({
            Destination: { ToAddresses: args.emails },
            Source: AppConfig.AWS.SES_FROM_EMAIL,
            Message: {
                Subject: { Data: args.subject, Charset: 'utf8' },
                Body: {
                    Html: {
                        Data: GenerateTemplate(TEMPLATES[args.template](args.data)),
                        Charset: 'utf8'
                    }
                }
            }
        });
        const result = await this._sesClient.send(command);
        Logger.Debug(result, '[EMAIL]');
        Logger.Info(`Email sent to ${args.emails.join(', ')} of type ${args.template}`, '[EMAIL]');
    }

    private async _sendWithSendGrid(args: SQSSendEmailArgs<any>) {
        const message: MailDataRequired = {
            to: args.emails,
            from: AppConfig.SENDGRID.FROM_EMAIL,
            subject: args.subject,
            html: GenerateTemplate(TEMPLATES[args.template](args.data))
        };
        const result = await this._sendGridMailClient.sendMultiple(message);
        Logger.Debug(result, '[EMAIL]');
        Logger.Info(`Email sent to ${args.emails.join(', ')} of type ${args.template}`, '[EMAIL]');
    }

    async Send(args: SQSSendEmailArgs<any>) {
        await this._sendWith.SENDGRID(args);
    }
}
