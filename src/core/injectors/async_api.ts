import { INestApplication } from '@nestjs/common';
// import { AsyncApiDocumentBuilder, AsyncApiModule } from 'nestjs-asyncapi';

export default async function InjectAsyncApi(app: INestApplication) {
    // const asyncApiOptions = new AsyncApiDocumentBuilder()
    //     .setTitle('ATHLINC API - Socket IO')
    //     .setDescription('API documentation specifically for Socket IO')
    //     .setVersion('1.0')
    //     .build();

    // const asyncapiDocument = await AsyncApiModule.createDocument(app, asyncApiOptions);
    // await AsyncApiModule.setup('/v1/api/ws', app, asyncapiDocument);
}
