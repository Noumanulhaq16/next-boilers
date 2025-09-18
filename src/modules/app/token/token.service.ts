import { Injectable } from '@nestjs/common';
import { TokenReason } from '@prisma/client';
import { ExceptionMessage, TOKEN_EXPIRATION_THRESHOLD_TIME } from '../../../constants';
import DatabaseService from 'database/database.service';
import { AddHours, Now } from 'helpers/date.helper';
import CreatePasswordTokenRequestDTO from './dto/request/create.request';
import { BadRequestException } from 'core/exceptions/response.exception';

type getTokenParams = {
    uuid: string;
    code?: string;
    reason?: TokenReason;
};

@Injectable()
export default class TokenService {
    constructor(private _dbService: DatabaseService) {}

    async CreatePasswordToken(data: CreatePasswordTokenRequestDTO) {
        const token = await this._dbService.token.create({
            data: {
                uuid: data.uuid,
                ...(data.code && { code: data.code }),
                reason: data.reason,
                ...(data.userId && { userId: data.userId }),
                ...(data.meta && { meta: data.meta }),
                expiredAt: AddHours(Now(), TOKEN_EXPIRATION_THRESHOLD_TIME)
            }
        });

        return token;
    }

    async GetToken({ uuid, code, reason }: getTokenParams) {
        const token = await this._dbService.token.findFirst({
            where: { uuid, ...(!!code && { code }), ...(!!reason && { reason }) }
        });

        if (!token) {
            throw new BadRequestException(ExceptionMessage.auth.invalidToken);
        }
        if (token.expiredAt < Now()) {
            throw new BadRequestException(ExceptionMessage.auth.expiredToken);
        }

        return token;
    }
}
