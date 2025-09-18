import { Injectable } from '@nestjs/common';
import RedisService from 'core/cache/redis.service';

export class SocketModel {
    public userId: number;
    public socketId: string;

    constructor(socketId: string, userId: number) {
        this.userId = userId;
        this.socketId = socketId;
    }
}

@Injectable()
export default class SocketHelper {
    constructor(private _cacheService: RedisService) {}

    private _getSocketKey(socketId: string): string {
        return 'SOCK:' + socketId;
    }
    public _getSocketEntityKey(entityId: number): string {
        return 'SOCK-ENT:' + entityId;
    }

    public async SetSocketIdsByUserId(socketIds: Array<string>, userId: number) {
        await this._cacheService.Set(this._getSocketEntityKey(userId), socketIds);
        return true;
    }

    public async GetSocketIdsByUserId(userId: number): Promise<Array<string>> {
        const socketIds: string[] = await this._cacheService.Get(this._getSocketEntityKey(userId));
        return socketIds || [];
    }

    public async GetSocketIdsByUserIds(userIds: Array<number>): Promise<Array<string>> {
        const allSocketIds: Array<string> = [];
        for (let userId of userIds) {
            const socketIds = await this.GetSocketIdsByUserId(userId);
            allSocketIds.push(...socketIds);
        }
        return allSocketIds;
    }

    public async RemoveSocketIdFromUserSockets(socketId: string, userId: number): Promise<boolean> {
        let socketIds: Array<string> = await this.GetSocketIdsByUserId(userId);
        socketIds = socketIds.filter((id) => id !== socketId);
        await this.SetSocketIdsByUserId(socketIds, userId);
        return true;
    }

    public async SetSocketDataById(socketId: string, userId: number) {
        const socketData = new SocketModel(socketId, userId);
        await this._cacheService.Set(this._getSocketKey(socketId), socketData);
    }

    public async GetSocketDataById(socketId: string): Promise<SocketModel> {
        const socketData = await this._cacheService.Get(this._getSocketKey(socketId));
        return socketData;
    }

    public async RemoveSocketDataById(socketId: string): Promise<boolean> {
        await this._cacheService.Delete(this._getSocketKey(socketId));
        return true;
    }

    public async AddUserSocket(socketId: string, userId: number) {
        const socketIds = await this.GetSocketIdsByUserId(userId);
        socketIds.push(socketId);
        await this.SetSocketIdsByUserId(socketIds, userId);
        await this.SetSocketDataById(socketId, userId);
    }

    public async RemoveUserSocket(socketId: string, userId: number) {
        await this.RemoveSocketIdFromUserSockets(socketId, userId);
        await this.RemoveSocketDataById(socketId);
    }

    public _getRoomKey(roomId: number): string {
        return 'ROOM:' + roomId;
    }

    public _getUserToRoomMappingKey(userId: number) {
        return 'USERS_ROOM:' + userId;
    }

    //room to user mapping
    public async addUserToRoom(roomId: number, userId: number) {
        const roomData = await this._cacheService.Get(this._getRoomKey(roomId));
        let userIds: number[] = roomData ? roomData : [];
        if (!userIds.includes(userId)) {
            userIds.push(userId);
        }
        await this._cacheService.Set(this._getRoomKey(roomId), userIds);
    }

    //user to room mapping
    public async addRoomToUser(roomId: number, userId: number) {
        const userRoomsData = await this._cacheService.Get(this._getUserToRoomMappingKey(userId));
        console.log(userRoomsData, 'USERS ROOM DATA');
        let roomIds: number[] = userRoomsData ? userRoomsData : [];
        if (!roomIds.includes(roomId)) {
            roomIds.push(roomId);
        }
        await this._cacheService.Set(this._getUserToRoomMappingKey(userId), roomIds);
    }

    //remove room from user to room mapping
    public async removeRoomFromUserToRoomMapping(roomId: number, userId: number) {
        const userRoomsData = await this._cacheService.Get(this._getUserToRoomMappingKey(userId));

        if (userRoomsData) {
            let roomIds: number[] = userRoomsData;
            roomIds = roomIds.filter((id) => id !== roomId);

            if (roomIds.length === 0) {
                await this._cacheService.Delete(this._getUserToRoomMappingKey(userId));
            } else {
                await this._cacheService.Set(this._getUserToRoomMappingKey(userId), roomIds);
            }
        }
    }

    public async getUserToRoomMappings(userId: number) {
        return await this._cacheService.Get(this._getUserToRoomMappingKey(userId));
    }

    public async removeUserFromRoom(roomId: number, userId: number) {
        const roomData = await this._cacheService.Get(this._getRoomKey(roomId));
        console.log(roomData, 'ROOM DATA');
        let userIds: number[] = roomData ? roomData : [];

        userIds = userIds.filter((id) => id !== userId);
        if (userIds.length == 0) {
            return await this._cacheService.Delete(this._getRoomKey(roomId));
        } else {
            await this._cacheService.Set(this._getRoomKey(roomId), userIds);
        }
    }

    public async deleteRoom(roomId: string) {}

    public async isUserInRoom(roomId: number, receiverId: number) {
        const room = await this._cacheService.Get(this._getRoomKey(roomId));
        if (room && room.includes(receiverId)) {
            return true;
        }
        return false;
    }
}
