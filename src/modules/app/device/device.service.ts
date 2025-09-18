import { Injectable } from '@nestjs/common';
import { Device, DeviceType, User } from '@prisma/client';
import { BooleanResponseDTO } from 'core/response/response.schema';
import DatabaseService from 'database/database.service';
import { GenerateUUID, GetDeviceType } from 'helpers/util.helper';
import { UpdateFCMTokenRequestDTO } from '../user/dto/request/update_fcm.request';
import CreateDeviceResponseDTO from './dto/response/create.response';
import DeviceModel from './dto/response/model_device';
import { CreateDeviceArgs } from './types';

@Injectable()
export default class DeviceService {
    constructor(private _dbService: DatabaseService) {}

    async Create(data: CreateDeviceArgs) {
        const deviceType: DeviceType = data.userAgent ? GetDeviceType(data.userAgent) : null;
        return await this._dbService.device.create({
            data: {
                userId: data.userId,
                authToken: data.authToken,
                uuid: GenerateUUID(),
                ...(data.userAgent && { userAgent: data.userAgent }),
                ...(deviceType && { type: deviceType })
            }
        });
    }

    async FindById(id: number): Promise<CreateDeviceResponseDTO> {
        return await this._dbService.device.findFirst({ where: { id } });
    }

    async FindByUUID(uuid: string): Promise<DeviceModel> {
        return await this._dbService.device.findFirst({ where: { uuid } });
    }

    async FindByAuthToken(authToken: string): Promise<DeviceModel> {
        return await this._dbService.device.findFirst({
            where: { authToken }
        });
    }

    async FindByUserId(userId: number): Promise<DeviceModel[]> {
        return await this._dbService.device.findMany({
            where: { userId: userId }
        });
    }

    async Delete(authToken: string): Promise<BooleanResponseDTO> {
        await this._dbService.device.deleteMany({
            where: { authToken }
        });
        return { data: true };
    }

    async UpdateFCMToken(
        data: UpdateFCMTokenRequestDTO,
        user: User,
        device: Device
    ): Promise<BooleanResponseDTO> {
        await this._dbService.device.update({
            where: {
                id: device.id
            },
            data: {
                fcmToken: data.fcmToken
            }
        });

        return {
            data: true
        };
    }
}
