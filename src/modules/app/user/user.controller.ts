import { Body, Headers, Param, ParseIntPipe, Query } from '@nestjs/common';
import { Device, User, UserType } from '@prisma/client';
import {
    ApiController,
    Authorized,
    CurrentUser,
    Delete,
    Get,
    Patch,
    Post,
    Put
} from 'core/decorators';
import { CurrentDevice } from 'core/decorators/current_device.decorator';
import { BooleanResponseDTO } from 'core/response/response.schema';
import DeviceService from '../device/device.service';
import { ChangeUserStatusRequestDTO } from './dto/request/change_user_status.request';
import FindUsersRequestDTO from './dto/request/find.request';
import { UpdateFCMTokenRequestDTO } from './dto/request/update_fcm.request';
import { UpdateUserRequestDTO } from './dto/request/update_profile.request';
import { UpdateUserSettingsRequestDTO } from './dto/request/update_user_settings.request';
import FindUsersResponseDTO from './dto/response/find.response';
import GetUserByIdResponseDTO from './dto/response/getById.response';
import GetMeResponseDTO from './dto/response/me.response';
import UserService from './user.service';
import { InteractUserRequestDTO } from './dto/request/interact_user.request';
import { UserInteractionsDTO } from './dto/request/user_interactions.request';

@ApiController({ version: '1', tag: 'user' })
export default class UserController {
    constructor(private _userService: UserService, private _deviceService: DeviceService) {}

    @Authorized([], 'ALL')
    @Get({
        path: '/users/me',
        description: 'Get current user details',
        response: GetMeResponseDTO
    })
    GetMe(@CurrentUser() user: User, @Headers() headers: any): Promise<GetMeResponseDTO> {
        return this._userService.GetMe(user, headers);
    }

    @Authorized([], 'ALL')
    @Patch({
        path: '/users/settings',
        response: BooleanResponseDTO,
        description: 'Update user settings'
    })
    async Update(
        @Body() data: UpdateUserSettingsRequestDTO,
        @CurrentUser() user: User
    ): Promise<BooleanResponseDTO> {
        return this._userService.UpdateUserSettings(user.id, data);
    }

    @Authorized()
    @Get({
        path: '/users',
        description: 'Get users listing',
        response: FindUsersResponseDTO
    })
    Find(
        @Query() data: FindUsersRequestDTO,
        @CurrentUser() user: User
    ): Promise<FindUsersResponseDTO> {
        return this._userService.Find(data, user);
    }

    @Authorized()
    @Get({
        path: '/users/athlete',
        description: 'Get coaches listing',
        response: FindUsersResponseDTO
    })
    AtheleteHome(@CurrentUser() user: User) {
        return this._userService.AthleteHome(user);
    }

    @Authorized()
    @Get({
        path: '/users/interactions',
        description: 'Get interactions based on types',
        response: FindUsersResponseDTO
    })
    UserInteractions(@Query() data: UserInteractionsDTO, @CurrentUser() user: User) {
        return this._userService.UserInteractions(data, user);
    }

    //FOR SEARCH
    @Authorized()
    @Get({
        path: '/users/search',
        description: 'Search for all users type',
        response: FindUsersResponseDTO
    })
    Search(@Query() data: FindUsersRequestDTO, @CurrentUser() user: User) {
        return this._userService.Search(data, user);
    }

    @Authorized()
    @Get({
        path: '/users/:id',
        description: 'Get user by id',
        response: GetUserByIdResponseDTO
    })
    Get(
        @Param('id', ParseIntPipe) id: number,
        @CurrentUser() user: User
    ): Promise<GetUserByIdResponseDTO> {
        return this._userService.Get(id, user);
    }

    @Authorized([], 'ALL')
    @Patch({
        path: '/users/:id',
        description: 'Update user profile',
        response: BooleanResponseDTO
    })
    UpdateUser(
        @Param('id', ParseIntPipe) id: number,
        @Body() data: UpdateUserRequestDTO,
        @CurrentUser() user: User
    ): Promise<BooleanResponseDTO> {
        return this._userService.UpdateUser(id, data, user);
    }

    @Authorized([UserType.ATHLETE, UserType.COACH])
    @Delete({
        path: '/users/:id',
        description: 'Delete User',
        response: BooleanResponseDTO
    })
    DeleteUser(
        @Param('id', ParseIntPipe) id: number,
        @CurrentUser() user: User
    ): Promise<BooleanResponseDTO> {
        return this._userService.DeleteUser(id, user);
    }

    @Authorized()
    @Put({
        path: '/users/fcm',
        description: 'Update FCM Token',
        response: BooleanResponseDTO
    })
    UpdateFCMToken(
        @Body() data: UpdateFCMTokenRequestDTO,
        @CurrentUser() user: User,
        @CurrentDevice() device: Device
    ): Promise<BooleanResponseDTO> {
        return this._deviceService.UpdateFCMToken(data, user, device);
    }

    @Authorized([UserType.ADMIN])
    @Put({
        path: '/users/:id/status',
        description: 'Change user status',
        response: BooleanResponseDTO
    })
    ChangeUserStatus(
        @Param('id', ParseIntPipe) id: number,
        @Body() data: ChangeUserStatusRequestDTO,
        @CurrentUser() user: User
    ): Promise<BooleanResponseDTO> {
        return this._userService.ChangeUserStatus(id, data, user);
    }

    @Authorized([UserType.ATHLETE, UserType.COACH])
    @Post({
        path: '/users/:id/block',
        description: 'Block User',
        response: BooleanResponseDTO
    })
    BlockUser(
        @Param('id', ParseIntPipe) id: number,
        @CurrentUser() user: User
    ): Promise<BooleanResponseDTO> {
        return this._userService.ToggleBlockUser(id, user, true);
    }

    @Authorized([UserType.ATHLETE, UserType.COACH])
    @Post({
        path: '/users/:id/unblock',
        description: 'Unblock User',
        response: BooleanResponseDTO
    })
    UnBlockUser(
        @Param('id', ParseIntPipe) id: number,
        @CurrentUser() user: User
    ): Promise<BooleanResponseDTO> {
        return this._userService.ToggleBlockUser(id, user, false);
    }

    @Authorized([UserType.ATHLETE, UserType.COACH])
    @Post({
        path: '/users/:id/interact',
        description: 'Interact with User',
        response: BooleanResponseDTO
    })
    InteractUser(
        @Param('id', ParseIntPipe) id: number,
        @CurrentUser() user: User,
        @Body() data: InteractUserRequestDTO
    ): Promise<BooleanResponseDTO> {
        return this._userService.InteractUser(id, user, data);
    }
}
