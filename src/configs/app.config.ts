import { config } from 'dotenv';
config();

const AppConfig = {
    APP: {
        NAME: 'ATHLINC-API',
        PORT: Number(process.env.PORT),
        DEBUG: process.env.DEBUG === 'true',
        LOG: process.env.LOG === 'true',
        LOG_LEVEL: Number(process.env.LOG_LEVEL),
        TOKEN_EXPIRATION: Number(process.env.TOKEN_EXPIRATION),
        URLS: {
            BASE_API_URL: process.env.APPLICATION_BASE_API_URL
        },
        WITH_SCHEDULE: process.env.WITH_SCHEDULE,
        PAYMENTS_ENABLED: process.env.PAYMENTS_ENABLED === 'true',
        IS_ENV_PRODUCTION: process.env.NODE_ENV === 'production'
    },
    DATABASE: {
        URL: process.env.DATABASE_URL
    },
    REDIS: {
        HOST: process.env.REDIS_HOST,
        PORT: Number(process.env.REDIS_PORT)
    },
    AWS: {
        ACCESS_KEY: process.env.AWS_ACCESS_KEY,
        SECRET_KEY: process.env.AWS_SECRET_KEY,
        REGION: process.env.AWS_REGION,
        BUCKET: process.env.AWS_BUCKET,
        BUCKET_BASE_URL: process.env.AWS_BUCKET_BASE_URL,
        STS_ROLE_ARN: process.env.AWS_STS_ROLE_ARN,
        QUEUE_URL: process.env.AWS_QUEUE_URL,
        SES_FROM_EMAIL: process.env.AWS_SES_FROM_EMAIL
    },
    TWILIO: {
        ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
        AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
        FROM_NUMBER: process.env.TWILIO_FROM_NUMBER
    },
    OAUTH: {
        GOOGLE: process.env.GOOGLE_OAUTH_ENDPOINT,
        APPLE: process.env.APPLE_OAUTH_ENDPOINT,
        FACEBOOK: process.env.FACEBOOK_OAUTH_ENDPOINT
    },
    FIREBASE: {
        PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
        PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY,
        CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL
    },
    LAMBDA: {
        THUMBNAIL_API_TOKEN: process.env.LAMBDA_API_TOKEN
    },
    SENDGRID: {
        API_KEY: process.env.SENDGRID_API_KEY,
        FROM_EMAIL: process.env.SENDGRID_FROM_EMAIL
    }
};

export default AppConfig;
