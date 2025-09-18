import { ApiController, Authorized, Get } from 'core/decorators';
import SportService from './sport.service';
import { FindSportsResponseDTO } from './dto/response/find.response';
import { UserType } from '@prisma/client';

@ApiController({
    path: '/sports',
    tag: 'sport',
    version: '1'
})
export default class SportController {
    constructor(private _sportService: SportService) {}

    @Authorized([UserType.ADMIN, UserType.ATHLETE, UserType.COACH], 'ALL')
    @Get({
        path: '/',
        description: 'Find Sports',
        response: FindSportsResponseDTO
    })
    FindSports(): Promise<FindSportsResponseDTO> {
        return this._sportService.FindSports();
    }
}
