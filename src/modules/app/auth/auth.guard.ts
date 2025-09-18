import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserStatus, UserType } from '@prisma/client';
import AppConfig from 'configs/app.config';
import { ForbiddenException, UnAuthorizedException } from 'core/exceptions/response.exception';
import AuthService, { AuthModel } from './auth.service';

@Injectable()
export default class AuthGuard implements CanActivate {
    constructor(private _reflector: Reflector, private _authService: AuthService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const requiredAuthorization = this._reflector.get<string[]>(
            'authorization',
            context.getHandler()
        );
        const roles = this._reflector.get<UserType[]>('roles', context.getHandler());
        const statuses = this._reflector.get<UserStatus[]>('statuses', context.getHandler());
        const lambdaAuthorization = this._reflector.get<string>(
            'lambda-authorization',
            context.getHandler()
        );

        if (requiredAuthorization) {
            const token = request.headers['authorization'];
            if (!token) {
                throw new UnAuthorizedException();
            }

            let auth: AuthModel = await this._authService.GetSession(token);
            if (
                !auth ||
                (auth && !auth.User) ||
                (roles.length && !roles.includes(auth.User.type))
            ) {
                throw new UnAuthorizedException();
            } else if (statuses.length && !statuses.includes(auth.User.status)) {
                throw new ForbiddenException();
            }

            request.user = auth.User;
        }

        if (lambdaAuthorization) {
            const token = request.headers['authorization'];
            if (!token) {
                throw new UnAuthorizedException();
            }

            if (token !== AppConfig.LAMBDA.THUMBNAIL_API_TOKEN) {
                throw new UnAuthorizedException();
            }
        }

        return true;
    }
}
