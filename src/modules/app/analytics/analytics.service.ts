import { Injectable } from '@nestjs/common';
import { User, UserInteractionType } from '@prisma/client';
import * as moment from 'moment-timezone';
import DatabaseService from 'database/database.service';
import { AnalyticsRequestDTO, AnalyticsType } from './dto/request/find_analytics.request';
import {
    _generateLastWeekDates,
    AllowDateFormat,
    EndDateOfMonth,
    EndDateOfNthWeek,
    EndOfYear,
    generateDayIntervalKeysBetweenTwoDates,
    generateMonthIntervalKeysBetweenTwoDates,
    generateWeekIntervalKeysBetweenTwoDates,
    generateYearIntervalKeysBetweenTwoDates,
    StartDateOfMonth,
    StartDateOfNthWeek,
    StartOfYear,
    SubtractDays,
    SubtractYears
} from 'helpers/date.helper';
import { BadRequestException } from 'core/exceptions/response.exception';
import {
    AnalyticsResponseDTO,
    AnalyticsResponseModel
} from './dto/response/find_analytics.response';

@Injectable()
export default class AnalyticsService {
    constructor(private _dbService: DatabaseService) {}

    private _generateKeysAndDatesByAnalyticsType(type: AnalyticsType) {
        let today = new Date();
        let keys: string[] = [];
        let startDate: Date = null;
        let endDate: Date = null;
        let intervalType: 'day' | 'week' | 'month' | 'year' = null;
        let currentKey: string = null;

        switch (type) {
            case AnalyticsType.MONTH:
                startDate = StartOfYear(today);
                endDate = EndOfYear(today);
                keys = generateMonthIntervalKeysBetweenTwoDates(startDate, endDate);
                intervalType = 'month';
                currentKey = moment().format(AllowDateFormat.YYYY + '-' + AllowDateFormat.MM);
                break;
            case AnalyticsType.YEAR:
                startDate = StartOfYear(SubtractYears(today, 4));
                endDate = EndOfYear(today);
                keys = generateYearIntervalKeysBetweenTwoDates(startDate, endDate);
                intervalType = 'year';
                currentKey = moment().format(AllowDateFormat.YYYY);
                break;
            case AnalyticsType.WEEK:
                startDate = StartDateOfMonth(today);
                endDate = EndDateOfMonth(today);
                keys = generateWeekIntervalKeysBetweenTwoDates(startDate, endDate);
                intervalType = 'week';
                currentKey = moment().format('gggg-ww');
                break;
            case AnalyticsType.DAY:
                startDate = new Date(moment(new Date()).startOf('week').format());
                endDate = new Date(moment(new Date()).endOf('week').format());
                keys = generateDayIntervalKeysBetweenTwoDates(startDate, endDate);
                intervalType = 'day';
                currentKey = moment().format(
                    AllowDateFormat.YYYY + '-' + AllowDateFormat.MM + '-' + AllowDateFormat.DD
                );
                break;
            default:
                throw new BadRequestException();
        }

        return { keys, startDate, endDate, intervalType, currentKey };
    }

    private _getDateRangeForGraphs(type: AnalyticsType) {
        let today = new Date();
        let startDate = null;
        let endDate = null;
        let intervalType = null;
        let keys: string[] = [];

        switch (type) {
            case AnalyticsType.MONTH:
                startDate = StartDateOfMonth(startDate);
                endDate = StartDateOfMonth(endDate);
                intervalType = AnalyticsType.MONTH;
                break;
            case AnalyticsType.WEEK:
                startDate = SubtractDays(today, 7);
                endDate = moment(today).format();
                intervalType = AnalyticsType.WEEK;
                keys = _generateLastWeekDates(today);
                break;
            default:
                throw new BadRequestException();
        }

        return {
            startDate,
            endDate,
            intervalType,
            keys
        };
    }

    async LikesGraph(data: AnalyticsRequestDTO, user: User): Promise<AnalyticsResponseDTO> {
        const { keys, intervalType } = this._generateKeysAndDatesByAnalyticsType(data.type);

        const promises = keys.map((key, index) => {
            return this._dbService.userInteraction.aggregate({
                where: {
                    createdAt:
                        data.type != AnalyticsType.WEEK
                            ? {
                                  gte: moment(new Date(key)).startOf(intervalType).format(),
                                  lte: moment(new Date(key)).endOf(intervalType).format()
                              }
                            : {
                                  gte: StartDateOfNthWeek(index, new Date()),
                                  lte: EndDateOfNthWeek(index, new Date())
                              },
                    deletedAt: null,
                    objectUserId: user.id,
                    type: UserInteractionType.LIKED
                },
                _count: { id: true }
            });
        });

        const promiseResults = await Promise.all(promises);

        const result = keys.reduce<Record<string, AnalyticsResponseModel>>((prev, next, index) => {
            return {
                ...prev,
                [next]: {
                    count: promiseResults[index]?._count?.id || 0
                }
            };
        }, {});

        return result as any;
    }

    async DislikesGraph(data: AnalyticsRequestDTO, user: User): Promise<AnalyticsResponseDTO> {
        const { keys, intervalType } = this._generateKeysAndDatesByAnalyticsType(data.type);

        const promises = keys.map((key, index) => {
            return this._dbService.userInteraction.aggregate({
                where: {
                    createdAt:
                        data.type != AnalyticsType.WEEK
                            ? {
                                  gte: moment(new Date(key)).startOf(intervalType).format(),
                                  lte: moment(new Date(key)).endOf(intervalType).format()
                              }
                            : {
                                  gte: StartDateOfNthWeek(index, new Date()),
                                  lte: EndDateOfNthWeek(index, new Date())
                              },
                    deletedAt: null,
                    objectUserId: user.id,
                    type: UserInteractionType.DISLIKED
                },
                _count: { id: true }
            });
        });

        const promiseResults = await Promise.all(promises);

        const result = keys.reduce<Record<string, AnalyticsResponseModel>>((prev, next, index) => {
            return {
                ...prev,
                [next]: {
                    count: promiseResults[index]?._count?.id || 0
                }
            };
        }, {});

        return result as any;
    }

    async ChatsInitiatedGraph(
        data: AnalyticsRequestDTO,
        user: User
    ): Promise<AnalyticsResponseDTO> {
        const { keys, intervalType } = this._generateKeysAndDatesByAnalyticsType(data.type);
        const promises = keys.map((key, index) => {
            return this._dbService.chat.aggregate({
                where: {
                    createdAt:
                        data.type != AnalyticsType.WEEK
                            ? {
                                  gte: moment(new Date(key)).startOf(intervalType).format(),
                                  lte: moment(new Date(key)).endOf(intervalType).format()
                              }
                            : {
                                  gte: StartDateOfNthWeek(index, new Date()),
                                  lte: EndDateOfNthWeek(index, new Date())
                              },
                    deletedAt: null,
                    participants: { some: { userId: user.id, deletedAt: null } }
                },
                _count: { id: true }
            });
        });

        const promiseResults = await Promise.all(promises);
        const result = keys.reduce<Record<string, AnalyticsResponseModel>>((prev, next, index) => {
            return {
                ...prev,
                [next]: {
                    count: promiseResults[index]?._count?.id || 0
                }
            };
        }, {});
        return result as any;
    }

    async LikesGraphv2(data: AnalyticsRequestDTO, user: User) {
        const { keys } = this._getDateRangeForGraphs(data.type);

        let promises = keys.map((val) => {
            return this._dbService.userInteraction.aggregate({
                _count: {
                    id: true
                },
                where: {
                    type: UserInteractionType.LIKED,
                    deletedAt: null,
                    objectUserId: user.id,
                    createdAt: {
                        gte: moment(val).startOf('day').format(),
                        lt: moment(val).add(1, 'day').startOf('day').format()
                    }
                }
            });
        });

        const promisesResult = await Promise.all(promises);

        const res = keys.reduce((prev, current, index) => {
            return {
                ...prev,
                [current]: {
                    count: promisesResult[index]?._count?.id || 0
                }
            };
        }, {});

        return res;
    }

    async DisLikesGraphv2(data: AnalyticsRequestDTO, user: User) {
        const { keys } = this._getDateRangeForGraphs(data.type);

        let promises = keys.map((val) => {
            return this._dbService.userInteraction.aggregate({
                _count: {
                    id: true
                },
                where: {
                    type: UserInteractionType.DISLIKED,
                    deletedAt: null,
                    objectUserId: user.id,
                    createdAt: {
                        gte: moment(val).startOf('day').format(),
                        lt: moment(val).add(1, 'day').startOf('day').format()
                    }
                }
            });
        });

        const promisesResult = await Promise.all(promises);

        const res = keys.reduce((prev, current, index) => {
            return {
                ...prev,
                [current]: {
                    count: promisesResult[index]?._count?.id || 0
                }
            };
        }, {});

        return res;
    }

    async ConnectedEntitiesGraph(data: AnalyticsRequestDTO, user: User) {
        const { keys } = this._getDateRangeForGraphs(data.type);
        const promises = keys.map((key, index) => {
            return this._dbService.chat.aggregate({
                where: {
                    createdAt: {
                        gte: moment(key).startOf('day').format(),
                        lt: moment(key).add(1, 'day').startOf('day').format()
                    },
                    deletedAt: null,
                    participants: { some: { userId: user.id, deletedAt: null } }
                },
                _count: { id: true }
            });
        });

        const promiseResults = await Promise.all(promises);
        const result = keys.reduce<Record<string, AnalyticsResponseModel>>((prev, next, index) => {
            return {
                ...prev,
                [next]: {
                    count: promiseResults[index]?._count?.id || 0
                }
            };
        }, {});
        return result as any;
    }
}
