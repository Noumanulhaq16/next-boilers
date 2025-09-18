import { Body, Headers } from '@nestjs/common';
import { User } from '@prisma/client';
import { ApiController, Authorized, CurrentUser, Post } from 'core/decorators';
import { BooleanResponseDTO } from 'core/response/response.schema';
import { ChangePasswordRequestDTO } from './dto/request/change_password.request';
import {
    ForgetPasswordRequestDTO,
    ForgetPasswordVerificationRequestDTO
} from './dto/request/forget_password.request';
import LoginRequestDTO from './dto/request/login.request';
import ResetPasswordRequestDTO from './dto/request/reset_password.request';
import { SignupRequestDTO, SignupVerificationRequestDTO } from './dto/request/signup.request';

import {
    ForgetPasswordResponseDTO,
    ForgetPasswordVerificationResponseDTO
} from './dto/response/forget_password.response';
import LoginResponseDTO from './dto/response/login.response';
import { ResetPasswordResponseDTO } from './dto/response/reset_password.response';
import SignupResponseDTO from './dto/response/signup.response';
import UserService from './user.service';
import OAuthLoginRequestDTO from './dto/request/oauth_login.request';

@ApiController({ version: '1', tag: 'auth', path: '/auth' })
export default class AuthController {
    constructor(private _userService: UserService) {}

    @Post({
        path: '/login',
        description: 'Login to the application',
        response: LoginResponseDTO
    })
    Login(@Body() data: LoginRequestDTO, @Headers() headers: any): Promise<LoginResponseDTO> {
        return this._userService.Login(data, headers);
    }

    @Post({
        path: '/login/oauth',
        description: 'Login with OAuth apps',
        response: LoginResponseDTO
    })
    OAuthLogin(
        @Body() data: OAuthLoginRequestDTO,
        @Headers() headers: any
    ): Promise<LoginResponseDTO> {
        return this._userService.OAuthLogin(data, headers);
    }

    @Post({
        path: '/signup',
        description: 'Signup in the application as User',
        response: SignupResponseDTO
    })
    SignupRequest(@Body() data: SignupRequestDTO): Promise<SignupResponseDTO> {
        return this._userService.SignupRequest(data);
    }

    @Post({
        path: '/signup/verification',
        description: 'Verify Signup',
        response: SignupResponseDTO
    })
    SignupVerification(
        @Body() data: SignupVerificationRequestDTO,
        @Headers() headers: any
    ): Promise<SignupResponseDTO> {
        return this._userService.SignupVerification(data, headers);
    }

    @Post({
        path: '/forget-password',
        description: 'Forget password initiate',
        response: ForgetPasswordResponseDTO
    })
    ForgetPassword(@Body() data: ForgetPasswordRequestDTO): Promise<ForgetPasswordResponseDTO> {
        return this._userService.ForgetPassword(data);
    }

    @Post({
        path: '/forget-password/verification',
        description: 'Forget password verification',
        response: ForgetPasswordVerificationResponseDTO
    })
    ForgetPasswordVerification(
        @Body() data: ForgetPasswordVerificationRequestDTO
    ): Promise<ForgetPasswordVerificationResponseDTO> {
        return this._userService.ForgetPasswordVerification(data);
    }

    @Authorized([], 'ALL')
    @Post({
        path: '/change-password',
        description: 'Change password',
        response: ResetPasswordResponseDTO
    })
    ChangePassword(
        @CurrentUser() user: User,
        @Body() data: ChangePasswordRequestDTO,
        @Headers() headers: any
    ): Promise<ResetPasswordResponseDTO> {
        return this._userService.ChangePassword(user, data, headers);
    }

    @Post({
        path: '/reset-password',
        description: 'Reset password',
        response: ResetPasswordResponseDTO
    })
    ResetPassword(
        @Body() data: ResetPasswordRequestDTO,
        @Headers() headers: any
    ): Promise<ResetPasswordResponseDTO> {
        return this._userService.ResetPassword(data, headers);
    }

    @Authorized([], 'ALL')
    @Post({
        path: '/logout',
        description: 'Logout User',
        response: BooleanResponseDTO
    })
    Logout(@Headers() headers: any): Promise<BooleanResponseDTO> {
        const authToken = headers.authorization;
        return this._userService.Logout(authToken);
    }
}
