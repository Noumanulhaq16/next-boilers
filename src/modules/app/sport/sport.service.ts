import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import DatabaseService from 'database/database.service';
import { FindSportsResponseDTO } from './dto/response/find.response';

@Injectable()
export default class SportService {
    constructor(private _dbService: DatabaseService) {}

    async FindSports(): Promise<FindSportsResponseDTO> {
        const whereParams: Prisma.SportWhereInput = {};

        const sports = await this._dbService.sport.findMany({
            where: whereParams
        });

        const count = await this._dbService.sport.count({
            where: whereParams
        });
        return {
            data: sports,
            count
        };
    }
}
