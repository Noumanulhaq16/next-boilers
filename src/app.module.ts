import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import RedisModule from 'core/cache/redis.module';
import { HttpExceptionFilter } from 'core/exceptions/http.exception';
// import { TranslatorModule } from 'nestjs-translator';
import UserModule from 'modules/app/user/user.module';
import DatabaseModule from 'database/database.module';
import AuthModule from 'modules/app/auth/auth.module';
import AuthGuard from 'modules/app/auth/auth.guard';
import DeviceModule from 'modules/app/device/device.module';
import MediaModule from 'modules/app/media/media.module';
import CronModule from 'modules/cron/cron.module';
// import QueueModule from 'modules/queue/queue.module';
import EmailModule from 'modules/email/email.module';
import SMSModule from 'modules/sms/sms.module';
import OAuthModule from 'modules/oauth/oauth.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import NotificationModule from 'modules/notification/notification.module';
import { RootController } from 'root.controller';
import GalleryModule from 'modules/app/gallery/gallery.module';
import ReportModule from 'modules/app/report/report.module';
import SocketModule from 'modules/socket/socket.module';
import { TranslatorModuleOptions } from 'i18n/config';
import ChatModule from 'modules/app/chat/chat.module';
import SportModule from 'modules/app/sport/sport.module';
import AnalyticsModule from 'modules/app/analytics/analytics.module';
import SubscriptionModule from 'modules/app/subscription/subscription.module';
import { AdminModule } from 'modules/app/admin/admin.module';
@Module({
    imports: [
        // TranslatorModule.forRoot({
        //     defaultLang: TranslatorModuleOptions.defaultLang,
        //     global: TranslatorModuleOptions.global,
        //     requestKeyExtractor: TranslatorModuleOptions.requestKeyExtractor,
        //     translationSource: TranslatorModuleOptions.translationSource
        // }),
        EventEmitterModule.forRoot(),
        RedisModule,
        DatabaseModule,
        AuthModule,
        UserModule,
        DeviceModule,
        MediaModule,
        CronModule,
        // QueueModule,
        EmailModule,
        SMSModule,
        OAuthModule,
        NotificationModule,
        GalleryModule,
        ReportModule,
        SocketModule,
        ChatModule,
        SportModule,
        AnalyticsModule,
        SubscriptionModule,
        AdminModule
    ],
    controllers: [AppController, RootController],
    providers: [
        AppService,
        { provide: APP_FILTER, useClass: HttpExceptionFilter },
        { provide: APP_GUARD, useClass: AuthGuard }
    ]
})
export class AppModule {}
