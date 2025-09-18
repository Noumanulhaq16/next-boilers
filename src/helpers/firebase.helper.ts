import AppConfig from 'configs/app.config';
import { initializeApp, cert, ServiceAccount } from 'firebase-admin/app';
import * as admin from 'firebase-admin';

const creds: ServiceAccount = {
    projectId: AppConfig.FIREBASE.PROJECT_ID,
    privateKey: AppConfig.FIREBASE.PRIVATE_KEY?.replace(/\\n/g, '\n'),
    clientEmail: AppConfig.FIREBASE.CLIENT_EMAIL
};

export class FirebaseApp {
    private static _app = null;

    private constructor() {}

    public static async GetFirebaseApplicationInstance() {
        if (FirebaseApp._app === null) {
            FirebaseApp._app = await FirebaseApp._createApplication();
        }
        return FirebaseApp._app;
    }

    private static async _createApplication() {
        try {
            const serviceAccountPath = {
                type: 'service_account',
                project_id: 'athlinc-fd0df',
                private_key_id: 'c2e926aeade602de50f93cc2ebedeaa03902404c',
                private_key:
                    '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDfz3me1GyWoTmA\nKOdVeJaeGI04n64g8XcheupxkcsF8fyF1lZTjhHQOO0KT5iIJLfHPHgWW36UACSa\nzECtn7qb4hiA/CxRxelPhCl8Wg6GtBFBijmEk7alwq3eG5BKkXF+HQo8v3mVQB61\nFJk7zO4QWi6jfWG0LO2LXzGuIraMRpIUqrlVs3hxgMZokr511dBQhPnr22cCKqT+\nB+z71FFBlyFe/blngJ/G38X+vJFMi/qVxr8KyjkcBDQUVvOm5nZ67KWipWcVfG4l\nnbsejrqzQwrdAgPR45tU68X0L655ObteaYtsNG06e9SpwLUuCi1hNumbTn3z6VWm\nzl4TjFs3AgMBAAECggEAQDfDYV/5QmVDXvMdoYgmy3km+ELVD03JjXk70Ndw5iVP\nfEWKYpImqVTUKvu4vAOxGcFPgbbCBIxf9Gy7+DWXMUg4GLaCrvn3HmJBFxWuCleb\nhe833sMVis1n3w2QotzFsFZ7y/9yzvDlfrbI2wBLpLSDolSFFtI3XKC1XA5Iy8mg\nd8wYlGZIqFgaPw7Qqmk2WUvyxHggpanyeTBAdx245VrmAn+wMx7SztmhQhY26kfn\n2OuD3cA2m1wE822uVDJJ81AxOGeWQiPnnXdipIfN10/2AHNQpK/g9EBQ8OdpGwRR\nDYtJrBUymPX1akO/Ad7lTbonq+P6KeFxN33mP5iTBQKBgQD64ccgl1UgoOw3ewAa\nRWri7LWTRk+ji+Qa5jlH/Mbmq/reQ+u2ewvxUBQBZU6nhCqzdIlGY61UxG5csKMQ\ngL07p4XwGQDMv7YFuY5rbAc4sacuTZdCvp3dr0EoVkd2dpapbi75i5iY6vJacdq2\nVJoNDccs41sH3iYxPlmj3u0CuwKBgQDkYFE63rd4t61cgdwh2Q9RFxQ1+oSGtqPf\nnp8I/AAYWXQ4FjieCp3kLnzAkRPip+8ccIBWlKpF18jOm/rtXixb5GjfjiNdffeq\nc1tV/PMenFF9+tUD4MPbVkRvWrDwomOFI9O9/Nvp5mPurll9r+yUtxHBhgp7PWB7\nYWVJPRX3tQKBgQDMbZEus2GAVuBkTOvGfG4ePreuLArUvza93H8sc4M3j0e6OSom\n5ZjTp2bFxGEVCxMoa3s4ShyBCBbNnHkjB2Qq6dSv0g/exxBxFcRBMCOqRMhvaHYq\nwtwsOZQkZDmTBAq8QLYyTVeoszmMDV4kWEe2/1Ue9JvGi3QfiCjO6OXD5QKBgAoC\nDo095Vxs8DP1nOf+0yUClegnqlcc+eF62g1Svc5TXTx3/NMwM+sj/mOR+AUexuPA\nKl+g9DVLV4l2XHC6h8cfI1loqTQXqRrXI1GJXD4jK48RxvP8jZi3FxiqKMbi1umm\nwEi7JAgECK0VBubzJrL9stGARkVQU0IU6pNjEethAoGAf138Mc8mBv9OSXh6CxHd\nsBtetYbcO/AbzFxOMK1UAB4PA8dd/ea0Hr7jmabgpjxFPtwhAIJKIyzgjd56gXPa\nZS62/wtoq/vJqdy03I2fyiVXV0V1J+d15DD+ZiJSqNmo6AHdAjCP1hY2vOYZ3q5+\n2xRWOtFevcRjC9SAERtDbrA=\n-----END PRIVATE KEY-----\n',
                client_email: 'firebase-adminsdk-q2qfn@athlinc-fd0df.iam.gserviceaccount.com',
                client_id: '108432510622129290669',
                auth_uri: 'https://accounts.google.com/o/oauth2/auth',
                token_uri: 'https://oauth2.googleapis.com/token',
                auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
                client_x509_cert_url:
                    'https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-q2qfn%40athlinc-fd0df.iam.gserviceaccount.com',
                universe_domain: 'googleapis.com'
            } as admin.ServiceAccount;
            const app = admin.initializeApp({
                credential: admin.credential.cert(serviceAccountPath)
            });
            // const app = await initializeApp({
            //     credential: cert(creds)
            // });

            return app;
        } catch (err) {
            console.log('err', err);
        }
    }
}
