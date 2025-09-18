import { VersioningType } from '@nestjs/common';
import { App } from './app';
import AppConfig from 'configs/app.config';
import { InjectLogger, InjectSwagger, InjectPipes, InjectInterceptors } from 'core/injectors';
import { Logger } from 'helpers/logger.helper';
import InjectAsyncApi from 'core/injectors/async_api';

async function bootstrap() {
    /* Bootstrap express application */
    const app = await App.GetNestApplicationInstance();

    /* Enable API versioning */
    app.enableVersioning({ type: VersioningType.URI });

    /* Set proxy as trustful to forward IP address */
    app.set('trust proxy', 1);

    /* Add custom Injectors here */
    InjectPipes(app);
    InjectInterceptors(app);
    InjectLogger(app);
    InjectSwagger(app);
    await InjectAsyncApi(app);

    /* Start the application on a specified port */
    await app.listen(AppConfig.APP.PORT || 3000);
    Logger.Info('', `[APP PORT] : ${AppConfig.APP.PORT || 3000}`);
}
bootstrap();
