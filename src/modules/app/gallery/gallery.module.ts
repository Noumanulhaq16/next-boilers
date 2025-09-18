import { Module } from '@nestjs/common';
import DatabaseModule from 'database/database.module';
import GalleryController from './gallery.controller';
import GalleryService from './gallery.service';

@Module({
    imports: [DatabaseModule],
    exports: [GalleryService],
    providers: [GalleryService],
    controllers: [GalleryController]
})
export default class GalleryModule {}
