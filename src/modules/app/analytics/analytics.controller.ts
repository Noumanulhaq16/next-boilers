import { ApiController, Authorized, CurrentUser, Get } from 'core/decorators';
import AnalyticsService from './analytics.service';
import { User, UserType } from '@prisma/client';
import { Query } from '@nestjs/common';
import { AnalyticsResponseDTO } from './dto/response/find_analytics.response';
import { AnalyticsRequestDTO } from './dto/request/find_analytics.request';

@ApiController({
    path: '/analytics',
    tag: 'analytics',
    version: '1'
})
export default class AnalyticsController {
    constructor(private _analyticsService: AnalyticsService) {}

    @Authorized([UserType.ATHLETE, UserType.COACH])
    @Get({
        path: '/graph/likes',
        description: 'Get Likes Graph data (liked me)',
        response: AnalyticsResponseDTO
    })
    LikesGraph(@Query() data: AnalyticsRequestDTO, @CurrentUser() user: User) {
        return this._analyticsService.LikesGraphv2(data, user);
    }

    @Authorized([UserType.ATHLETE, UserType.COACH])
    @Get({
        path: '/graph/dislikes',
        description: 'Get Dislikes Graph data (disliked me)',
        response: AnalyticsResponseDTO
    })
    DislikesGraph(@Query() data: AnalyticsRequestDTO, @CurrentUser() user: User) {
        return this._analyticsService.DisLikesGraphv2(data, user);
    }

    @Authorized([UserType.ATHLETE, UserType.COACH])
    @Get({
        path: '/graph/chats-initiated',
        description: 'Get Chats Initiated Graph data',
        response: AnalyticsResponseDTO
    })
    ChatsInitiatedGraph(
        @Query() data: AnalyticsRequestDTO,
        @CurrentUser() user: User
    ): Promise<AnalyticsResponseDTO> {
        return this._analyticsService.ConnectedEntitiesGraph(data, user);
    }
}
