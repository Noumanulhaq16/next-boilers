import { Injectable } from '@nestjs/common';
import { Prisma, UserType } from '@prisma/client';
import DatabaseService from 'database/database.service';
import { AppSettingType } from './dto/app-settings.dto';
import { BlockUserDto } from './dto/block-user-dto';
import AuthService from '../auth/auth.service';
import { BadRequestException } from 'core/exceptions/response.exception';
import DeviceService from '../device/device.service';
import RedisService from 'core/cache/redis.service';
import { UserDetailDTO } from './dto/user-detail.dto';
import { UpdateAppSettingsDTO } from './dto/update-app-settings.dto';
import SocketHelper from 'modules/socket/socket.helper';

type SubscriptionStats = {
    plan_type: number; // 1 = PREMIUM, 2 = FREEMIUM
    user_count: number;
};

@Injectable()
export class AdminService {
    constructor(
        private _dbService: DatabaseService,
        private _authService: AuthService,
        private _deviceService: DeviceService,
        private _cacheService: RedisService,
        private _socketHelper: SocketHelper
    ) {}
    async List(type: UserType) {
        const data = await this._dbService.user.findMany({
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                gender: true,
                createdAt: true,
                phone: true,
                isBlocked: true,
                type: true,
                profilePicture: {
                    select: {
                        path: true
                    }
                }
            },
            where: { type, status: 'ACTIVE' }
        });
        return data.map((item) => {
            return {
                ...item,
                status: item.isBlocked
            };
        });
    }

    async userDetail(userDetailDTO: UserDetailDTO) {
        const { userType, userId } = userDetailDTO;

        const selectMap: Record<string, Prisma.UserSelect> = {
            ATHLETE: {
                email: true,
                type: true,
                id: true,
                phone: true,
                gender: true,
                firstName: true,
                lastName: true,
                profilePicture: {
                    select: {
                        path: true
                    }
                },
                addressInfo: {
                    select: {
                        address: true,
                        city: true,
                        state: true,
                        country: true
                    }
                },
                userInfo: {
                    select: {
                        coach: true,
                        sportPosition: true,
                        previousTeam: true,
                        currentTeam: true,
                        grade: true
                    }
                },
                userSubscription: {
                    select: {
                        startedAt: true,
                        expiredAt: true,
                        subscriptionPlan: {
                            select: {
                                type: true
                            }
                        }
                    }
                },
                achievements: {
                    select: {
                        name: true,
                        year: true
                    }
                },
                certificates: {
                    select: {
                        media: {
                            select: {
                                path: true
                            }
                        }
                    }
                },
                userSports: {
                    select: {
                        sportGender: true,
                        sport: {
                            select: {
                                title: true,
                                type: true
                            }
                        }
                    }
                }
            },
            COACH: {
                email: true,
                type: true,
                id: true,
                phone: true,
                gender: true,
                firstName: true,
                lastName: true,
                profilePicture: {
                    select: {
                        path: true
                    }
                },
                addressInfo: {
                    select: {
                        address: true,
                        city: true,
                        state: true,
                        country: true
                    }
                },
                userInfo: {
                    select: {
                        coach: true,
                        sportPosition: true,
                        previousTeam: true,
                        currentTeam: true,
                        grade: true
                    }
                },
                userSubscription: {
                    select: {
                        startedAt: true,
                        expiredAt: true,
                        subscriptionPlan: {
                            select: {
                                type: true
                            }
                        }
                    }
                },
                achievements: {
                    select: {
                        name: true,
                        year: true
                    }
                },
                certificates: {
                    select: {
                        media: {
                            select: {
                                path: true
                            }
                        }
                    }
                },
                userSports: {
                    select: {
                        sportGender: true,
                        sport: {
                            select: {
                                title: true,
                                type: true
                            }
                        }
                    }
                }
            }
        };

        const select = selectMap[userType];
        return this._dbService.user.findFirst({
            where: {
                id: userId,
                type: userType
            },
            select
        });
    }

    async usersCount() {
        const [totalAtheletes, totalCoaches] = await Promise.all([
            this._dbService.user.count({
                where: {
                    type: 'ATHLETE'
                }
            }),
            this._dbService.user.count({
                where: {
                    type: 'COACH'
                }
            })
        ]);
        return { totalAtheletes, totalCoaches, totalUsers: totalAtheletes + totalCoaches };
    }

    async listFeedback() {
        return await this._dbService.report.findMany({
            select: {
                id: true,
                description: true,
                reason: true,
                title: true,
                type: true,
                reportedUser: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        profilePicture: {
                            select: {
                                path: true
                            }
                        }
                    }
                },
                reporter: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        profilePicture: {
                            select: {
                                path: true
                            }
                        }
                    }
                },
                medias: {
                    select: {
                        media: {
                            select: {
                                path: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    }

    async subscriptionStatus() {
        const data = await this._dbService.$queryRaw<SubscriptionStats[]>`
        SELECT 
        sp.type AS plan_type,
        COUNT(us.id)::int AS user_count
        FROM "SubscriptionPlan" sp
        LEFT JOIN "UserSubscription" us 
        ON sp.id = us."subscriptionPlanId" 
        AND us."deletedAt" IS NULL
        GROUP BY sp.type;
        `;

        const total = data.reduce((sum, item) => sum + item.user_count, 0);
        const chartData = data.map((item) => ({
            label: item.plan_type === 1 ? 'PREMIUM' : 'FREEMIUM',
            value: ((item.user_count / total) * 100).toFixed(2)
        }));
        return chartData;
    }

    async appSettings(type: AppSettingType) {
        switch (type) {
            case AppSettingType.aboutApp:
                return this._dbService.appSettings.findFirst({
                    where: {},
                    select: {
                        id: true,
                        aboutApp: true
                    }
                });

            case AppSettingType.privacyPolicy:
                return await this._dbService.appSettings.findFirst({
                    where: {},
                    select: {
                        id: true,
                        privacyPolicy: true
                    }
                });

            case AppSettingType.termsAndConditions:
                return await this._dbService.appSettings.findFirst({
                    where: {},
                    select: {
                        id: true,
                        termsAndConditions: true
                    }
                });
        }
    }

    async blockUser(data: BlockUserDto) {
        const isBlocked = await this._dbService.user.findFirst({
            where: {
                id: data.userId,
                isBlocked: true
            }
        });
        if (isBlocked) {
            throw new BadRequestException('This user is already blocked');
        }
        const devices = await this._deviceService.FindByUserId(data.userId);
        const promises = [];
        devices.map((device) => {
            if (device.authToken) promises.push(this._authService.DeleteSession(device.authToken));
        });
        await Promise.all(promises);
        await this._dbService.device.deleteMany({ where: { userId: data.userId } });
        await this._dbService.user.update({
            where: {
                id: data.userId
            },
            data: {
                isBlocked: true
            }
        });
        if (data.type == 'COACH') {
            await this._cacheService.ScanAndRemove('freemium_user_ids:*');
        }

        const userRoomIds = await this._socketHelper.getUserToRoomMappings(data.userId);
        console.log(userRoomIds, 'USER ROOM IDS');
        if (Array.isArray(userRoomIds)) {
            const roomRemovePromises = userRoomIds.map((roomId: number) =>
                this._socketHelper.removeUserFromRoom(roomId, data.userId)
            );
            await Promise.all(roomRemovePromises);

            await this._cacheService.Delete(
                this._socketHelper._getUserToRoomMappingKey(data.userId)
            );
        }
        const socketIds = await this._socketHelper.GetSocketIdsByUserId(data.userId);
        console.log(socketIds, 'SOCKET IDS');
        const socketDeletePromises = socketIds.map((socketId: string) =>
            this._socketHelper.RemoveSocketDataById(socketId)
        );
        await Promise.all(socketDeletePromises);

        await this._cacheService.Delete(this._socketHelper._getSocketEntityKey(data.userId));

        return { message: 'user.blocked' };
    }

    async unblockUser(data: BlockUserDto) {
        const isUnBlocked = await this._dbService.user.findFirst({
            where: {
                id: data.userId,
                isBlocked: false
            }
        });
        if (isUnBlocked) {
            throw new BadRequestException('User is already unblocked');
        }
        await this._dbService.user.update({
            where: {
                id: data.userId
            },
            data: {
                isBlocked: false
            }
        });
        return { message: 'user.unblock' };
    }

    async listBlockedUsers() {
        return await this._dbService.user.findMany({
            where: {
                isBlocked: true
            },
            include: {
                profilePicture: {
                    select: {
                        path: true
                    }
                }
            }
        });
    }

    async subscriptionDetails(userId: number) {
        return this._dbService.userSubscription.findFirst({
            where: {
                userId
            },
            select: {
                startedAt: true,
                expiredAt: true,
                subscriptionPlan: {
                    select: {
                        price: true,
                        type: true
                    }
                }
            }
        });
    }

    async updateAppSettings(updateAppSettings: UpdateAppSettingsDTO) {
        const { type, data } = updateAppSettings;

        const record = await this._dbService.appSettings.findFirst({ where: {} });

        const updateData = {
            [type]: data
        };

        if (!record) {
            return this._dbService.appSettings.create({
                data: updateData
            });
        } else {
            return this._dbService.appSettings.update({
                where: { id: record.id },
                data: updateData
            });
        }
    }

    async mostActiveUsers() {
        return this._dbService.$queryRawUnsafe(`
          SELECT d."totalDevices"::int,
           u."id",
           u."email",
           u."firstName",
           u."lastName",
           u."type",
           u."gender"
           FROM (
           SELECT "userId", COUNT(*) AS "totalDevices"
           FROM "Device"
           GROUP BY "userId"
          ) d
          JOIN "User" u ON u."id" = d."userId"
          WHERE u."deletedAt" IS NULL AND u."status" != 'REGISTERING' AND u."type" != 'ADMIN'
          ORDER BY d."totalDevices" DESC
          LIMIT 10
         `);
    }
}
