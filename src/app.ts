import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';

export class App {
    private static _app: NestExpressApplication = null;

    private constructor() {}

    public static async GetNestApplicationInstance(): Promise<NestExpressApplication> {
        if (App._app === null) {
            App._app = await App._createApplication();
        }
        return App._app;
    }

    private static async _createApplication(): Promise<NestExpressApplication> {
        const app = await NestFactory.create<NestExpressApplication>(AppModule, {
            rawBody: true,
            cors: true
        });
        app.useBodyParser('json', { limit: '10mb' });

        return app;
    }
}
