import {
    BadRequestException,
    Body,
    Get,
    Query,
    Post,
    Patch,
    Param,
    ParseIntPipe
} from '@nestjs/common';
import { ListUsersDTO } from './dto/listUsers';
import { AdminService } from './admin.service';
import { ApiController, Authorized } from 'core/decorators';
import { AppSettingDTO } from './dto/app-settings.dto';
import { query } from 'express';
import { BlockUserDto } from './dto/block-user-dto';
import { UserType } from '@prisma/client';
import { UserDetailDTO } from './dto/user-detail.dto';
import { UpdateAppSettingsDTO } from './dto/update-app-settings.dto';

@ApiController({ version: '1', path: '/admin' })
export class AdminController {
    constructor(private adminService: AdminService) {}

    @Authorized()
    @Get('/users')
    List(@Query() query: ListUsersDTO) {
        return this.adminService.List(query.type);
    }

    @Authorized()
    @Get('/user-detail')
    Detail(@Query() userDetailDTO: UserDetailDTO) {
        return this.adminService.userDetail(userDetailDTO);
    }

    @Authorized()
    @Get('/users/count')
    UsersCount() {
        return this.adminService.usersCount();
    }

    @Authorized()
    @Get('/list-feedback')
    ListFeedback() {
        return this.adminService.listFeedback();
    }

    @Authorized()
    @Get('/subscription-stats')
    SubscriptionStatus() {
        return this.adminService.subscriptionStatus();
    }

    @Authorized()
    @Get('/app-settings')
    AppSettings(@Query() query: AppSettingDTO) {
        return this.adminService.appSettings(query.type);
    }

    @Authorized()
    @Post('/block-user')
    BlockUser(@Body() data: BlockUserDto) {
        return this.adminService.blockUser(data);
    }

    @Authorized()
    @Post('/unblock-user')
    UnBlockUser(@Body() data: BlockUserDto) {
        return this.adminService.unblockUser(data);
    }

    @Authorized()
    @Get('/blocked-users')
    ListBlockedUsers() {
        return this.adminService.listBlockedUsers();
    }

    @Authorized()
    @Patch('/app-settings')
    UpdateAppSettings(@Body() updatAppSettings: UpdateAppSettingsDTO) {
        return this.adminService.updateAppSettings(updatAppSettings);
    }

    @Authorized()
    @Get('/most-active-users')
    MostActiveUsers() {
        return this.adminService.mostActiveUsers();
    }
}
