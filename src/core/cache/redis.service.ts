import { CACHE_MANAGER } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export default class RedisService {
    constructor(@Inject(CACHE_MANAGER) private _cacheService: Cache) {}

    public async Set(key: string, value: any, ttl: number = 0) {
        return await this._cacheService.set(key, JSON.stringify(value), { ttl });
    }

    public async Get(key: string) {
        return JSON.parse(await this._cacheService.get(key));
    }

    public async Delete(key: string) {
        return await this._cacheService.del(key);
    }

    public async ScanAndRemove(pattern: string) {
        const redisStore: any = this._cacheService.store;

        if (typeof redisStore.keys !== 'function') {
            throw new Error('Redis store does not support keys() method');
        }

        const keys: string[] = await redisStore.keys(pattern);
        if (keys.length) {
            await Promise.all(keys.map((key) => this._cacheService.del(key)));
        }
        return;
    }
}
