import { Injectable } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import RedisService from 'core/cache/redis.service';
import DatabaseService from 'database/database.service';
import { User } from '@prisma/client';
import AppConfig from 'configs/app.config';
import { ExcludeFields } from 'helpers/util.helper';
import DeviceService from '../device/device.service';

export class AuthModel {
    Id: number;
    User: User | null;

    constructor(id: number, user?: User) {
        this.Id = id;
        if (user) {
            this.User = user;
        }
    }
}

@Injectable()
export default class AuthService {
    constructor(
        private _cacheService: RedisService,
        private _databaseService: DatabaseService,
        private _deviceService: DeviceService
    ) {}

    private _generateToken() {
        return uuid();
    }

    async CreateSession(userId: number, userAgent?: string): Promise<string> {
        const Token = this._generateToken();
        const Auth = new AuthModel(userId);
        await this._cacheService.Set(Token, Auth, AppConfig.APP.TOKEN_EXPIRATION);
        await this._deviceService.Create({
            userId: userId,
            authToken: Token,
            ...(userAgent && { userAgent: userAgent })
        });
        return Token;
    }

    async GetSession(token: string): Promise<AuthModel> {
        const Auth: AuthModel = await this._cacheService.Get(token);
        if (!Auth) return null;
        Auth.User = await this._databaseService.user.findFirst({
            where: { id: Auth.Id }
        });
        if (!Auth.User) return null;

        ExcludeFields(Auth.User, ['password']);
        return Auth;
    }

    async DeleteSession(token: string): Promise<boolean> {
        await this._cacheService.Delete(token);
        await this._deviceService.Delete(token);
        return true;
    }

    async RefreshTokenTime(token: string) {
        const Auth: AuthModel = await this._cacheService.Get(token);
        if (!Auth) return null;
        await this._cacheService.Set(token, Auth, AppConfig.APP.TOKEN_EXPIRATION);
    }
}
