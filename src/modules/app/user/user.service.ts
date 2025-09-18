import { Injectable } from '@nestjs/common';
import {
    MediaStatus,
    MediaType,
    Prisma,
    TokenReason,
    User,
    UserStatus,
    UserType,
    Device,
    UserOAuthType,
    UserRelationshipStatus,
    UserInteractionType,
    UserInteraction
} from '@prisma/client';
import { EmailTemplates, EventType, ExceptionMessage, SET_TO_NOTHING } from '../../../constants';
import DatabaseService from 'database/database.service';
import {
    BadRequestException,
    FatalErrorException,
    ForbiddenException,
    NotFoundException
} from 'core/exceptions/response.exception';
import { BooleanResponseDTO, StringResponseDTO } from 'core/response/response.schema';
import {
    ComparePassword,
    ExcludeFields,
    GenerateUUID,
    GenerateVerificationCode,
    GetOrderOptions,
    GetPaginationOptions,
    HashPassword
} from 'helpers/util.helper';
import AuthService from 'modules/app/auth/auth.service';
import TokenService from 'modules/app/token/token.service';
import {
    ForgotPasswordEmailPayload,
    ResetPasswordEmailPayload,
    UserVerificationEmailPayload
} from 'modules/email/types';
// import QueueService from 'modules/queue/queue.service';
import { SQSSendEmailArgs, SQSSendNotificationArgs } from 'modules/queue/types';
import FindUsersRequestDTO from './dto/request/find.request';
import {
    ForgetPasswordRequestDTO,
    ForgetPasswordVerificationRequestDTO
} from './dto/request/forget_password.request';
import LoginRequestDTO from './dto/request/login.request';
import ResetPasswordRequestDTO from './dto/request/reset_password.request';
import { SignupRequestDTO, SignupVerificationRequestDTO } from './dto/request/signup.request';
import FindUsersResponseDTO from './dto/response/find.response';
import {
    ForgetPasswordResponseDTO,
    ForgetPasswordVerificationResponseDTO
} from './dto/response/forget_password.response';
import LoginResponseDTO from './dto/response/login.response';
import SignupResponseDTO from './dto/response/signup.response';
import GetMeResponseDTO from './dto/response/me.response';
import { UpdateUserRequestDTO } from './dto/request/update_profile.request';
import { Logger } from 'helpers/logger.helper';
import GetUserByIdResponseDTO from './dto/response/getById.response';
import {
    AllowDateFormat,
    ConvertToDate,
    IsBefore,
    Now,
    AddDays,
    AddMonths,
    ConvertToSpecificFormat,
    ConvertToSpecificFormatInUTC,
    DiffBetweenTwoDates,
    getDayTimeNumber,
    DaysEnum
} from 'helpers/date.helper';
import { ChangePasswordRequestDTO } from './dto/request/change_password.request';

import OAuthLoginRequestDTO from './dto/request/oauth_login.request';
import OAuthService from 'modules/oauth/oauth.service';
import { OAuthProviders } from 'core/interfaces';
import DeviceService from '../device/device.service';
import { ChangeUserStatusRequestDTO } from './dto/request/change_user_status.request';
import { TUserMeta, UserRegistrationEventParams } from './types';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UserDetailsResponseModel, UserResponseModel } from './dto/response/model';
import { UpdateUserSettingsRequestDTO } from './dto/request/update_user_settings.request';
import { ResetPasswordResponseDTO } from './dto/response/reset_password.response';
import ChatService from '../chat/chat.service';
import { TTokenMeta } from '../token/types';
import { InteractUserRequestDTO } from './dto/request/interact_user.request';
import { SubscriptionPlanType } from '../subscription/dto/response/model';
import RedisService from 'core/cache/redis.service';
import NotificationService, { NotificationData } from 'modules/notification/notification.service';
import { UserInteractionsDTO } from './dto/request/user_interactions.request';

@Injectable()
export default class UserService {
    constructor(
        private _dbService: DatabaseService,
        private _authService: AuthService,
        private _tokenService: TokenService,
        private _deviceService: DeviceService,
        private _oauthService: OAuthService,
        private _eventEmitter: EventEmitter2,
        // private _queueService: QueueService,
        private _chatService: ChatService,
        private _cacheService: RedisService,
        private _notificationService: NotificationService
    ) {}

    private _allowedUserStatusChangeOperationsByRole: Record<UserType, UserStatus[]> = {
        [UserType.ATHLETE]: [UserStatus.ACTIVE, UserStatus.BLOCKED],
        [UserType.COACH]: [UserStatus.ACTIVE, UserStatus.BLOCKED, UserStatus.INACTIVE],
        [UserType.ADMIN]: []
    };
    private _allowedUserStatusChangeOperations: Record<UserStatus, UserStatus[]> = {
        [UserStatus.REGISTERING]: [],
        [UserStatus.INACTIVE]: [],
        [UserStatus.PENDING]: [UserStatus.ACTIVE, UserStatus.INACTIVE],
        [UserStatus.ACTIVE]: [UserStatus.BLOCKED],
        [UserStatus.BLOCKED]: [UserStatus.ACTIVE]
    };

    private _checkAllowedUserStatusChangeOperation(
        currentStatus: UserStatus,
        newStatus: UserStatus,
        userType: UserType
    ) {
        const allowedByRoleArr = this._allowedUserStatusChangeOperationsByRole[userType];
        const isAllowedByRole = allowedByRoleArr.includes(newStatus);
        if (!isAllowedByRole) {
            if (!allowedByRoleArr?.length) {
                throw new ForbiddenException(ExceptionMessage.user.notAllowed);
            }
            throw new ForbiddenException('user.operation_not_allowed', {
                status: this._allowedUserStatusChangeOperationsByRole[userType].join(' or ')
            });
        }
        const allowedByStatusArr = this._allowedUserStatusChangeOperations[currentStatus];
        if (!allowedByStatusArr?.length) {
            throw new ForbiddenException(ExceptionMessage.user.notAllowed);
        }
        const isAllowedByStatus = allowedByStatusArr.includes(newStatus);
        if (!isAllowedByStatus) {
            throw new ForbiddenException(ExceptionMessage.user.operationNotAllowed, {
                status: this._allowedUserStatusChangeOperations[currentStatus].join(' or ')
            });
        }
    }

    //1 = PREMIUM
    //2 = FREEMIUM
    async checkSubscriptionStatus(userId: any): Promise<string> {
        const subscription = await this._dbService.userSubscription.findFirst({
            where: { userId },
            select: {
                subscriptionPlan: {
                    select: {
                        type: true
                    }
                }
            }
        });
        return subscription?.subscriptionPlan.type === SubscriptionPlanType.FREEMIUM
            ? 'FREE'
            : 'PREMIUM';
    }

    async Login(data: LoginRequestDTO, reqHeaders: any): Promise<LoginResponseDTO> {
        const user = await this._dbService.user.findFirst({
            where: {
                email: data.email,
                type: data.type
            },
            select: { id: true, email: true, password: true, status: true, isBlocked: true }
        });

        if (!user) {
            throw new BadRequestException(ExceptionMessage.auth.invalidCredentials);
        }

        if (user && user.isBlocked) {
            throw new BadRequestException('auth.blocked');
        }

        const isPasswordMatched = await ComparePassword(data.password, user.password);
        if (!isPasswordMatched) {
            throw new BadRequestException(ExceptionMessage.auth.invalidCredentials);
        }

        const token = await this._authService.CreateSession(user.id, reqHeaders?.['user-agent']);

        return { token };
    }

    async OAuthLogin(data: OAuthLoginRequestDTO, reqHeaders: any): Promise<LoginResponseDTO> {
        const providerMappings: Record<UserOAuthType, OAuthProviders> = {
            [UserOAuthType.GOOGLE]: 'google',
            [UserOAuthType.APPLE]: 'apple',
            [UserOAuthType.FACEBOOK]: 'facebook'
        };
        const oauthResult = await this._oauthService.GetTokenData(
            data.providerId,
            providerMappings[data.providerType]
        );
        if (!oauthResult) {
            throw new BadRequestException('oauth.invalid_token');
        }
        const oauth = await this._dbService.userOAuth.findFirst({
            where: { providerId: oauthResult.id, type: data.providerType },
            select: {
                userId: true,
                user: {
                    select: {
                        isBlocked: true
                    }
                }
            }
        });
        if (oauth?.user?.isBlocked) {
            throw new ForbiddenException('user.blocked');
        }
        let newUserId: number = null;
        if (!oauth) {
            const newUser = await this.Signup({
                providerId: oauthResult.id,
                providerType: data.providerType,
                email: oauthResult.email,
                userType: data.userType,
                profilePicture: data.profilePicture
            });
            newUserId = newUser.id;
        }

        const user = await this._dbService.user.findFirst({
            where: { id: oauth?.userId || newUserId, type: data.userType },
            select: { id: true, status: true, email: true }
        });
        if (!user) {
            throw new NotFoundException('user.not_found');
        }

        if (oauth) {
            if (user.email != oauthResult.email) {
                await this._dbService.user.update({
                    where: { id: user.id },
                    data: { email: oauthResult.email }
                });
            }
        }

        const token = await this._authService.CreateSession(user.id, reqHeaders?.['user-agent']);

        return { token };
    }

    async SignupRequest(data: SignupRequestDTO): Promise<SignupResponseDTO> {
        const existingUser = await this._dbService.user.findFirst({
            where: { email: data.email, type: data.userType },
            select: { id: true }
        });
        if (existingUser) {
            throw new BadRequestException(ExceptionMessage.auth.emailAlreadyExist);
        }
        const tokenMeta: TTokenMeta = { verificationEmail: data.email };
        const token = await this._tokenService.CreatePasswordToken({
            uuid: GenerateUUID(),
            reason: TokenReason.USER_VERIFICATION,
            code: GenerateVerificationCode(),
            meta: tokenMeta
        });

        const emailPayload: SQSSendEmailArgs<UserVerificationEmailPayload> = {
            subject: 'Athlinc - OTP',
            template: EmailTemplates.USER_VERIFICATION,
            emails: [data.email],
            data: {
                otp: token.code
            }
        };
        // this._queueService.EnqueueEmail(emailPayload);

        return { token: token.uuid };
    }

    async SignupVerification(
        data: SignupVerificationRequestDTO,
        reqHeaders: any
    ): Promise<SignupResponseDTO> {
        const token = await this._tokenService.GetToken({
            uuid: data.token,
            code: data.code,
            reason: TokenReason.USER_VERIFICATION
        });

        const tokenMeta = <TTokenMeta>token.meta;
        const email = tokenMeta?.verificationEmail || '';

        const existingUser = await this._dbService.user.findFirst({
            where: { email, type: data.userType },
            select: { id: true }
        });
        if (existingUser) {
            throw new BadRequestException(ExceptionMessage.auth.emailAlreadyExist);
        }

        /*deleting Token record*/
        await this._dbService.token.delete({
            where: {
                id: token.id
            }
        });

        const signupData: SignupRequestDTO = {
            email: email,
            password: data.password,
            userType: data.userType
        };
        const user = await this.Signup(signupData);

        const authToken = await this._authService.CreateSession(
            user.id,
            reqHeaders?.['user-agent']
        );

        return { token: authToken };
    }

    async Signup(
        data: Partial<OAuthLoginRequestDTO & SignupRequestDTO>
    ): Promise<{ id: number; email: string; type: UserType }> {
        const existingUser = await this._dbService.user.findFirst({
            where: { email: data.email, type: data.userType },
            select: { id: true }
        });
        if (existingUser) {
            throw new BadRequestException(ExceptionMessage.auth.emailAlreadyExist);
        }
        const isOAuth = data.providerId && data.providerType;

        const freemiumSubscriptionPlan = await this._dbService.subscriptionPlan.findFirst({
            where: { type: SubscriptionPlanType.FREEMIUM },
            select: { id: true }
        });
        if (!freemiumSubscriptionPlan) {
            throw new NotFoundException(ExceptionMessage.payment.subscription_plan_not_found);
        }

        const user = await this._dbService.user.create({
            data: {
                email: data.email,
                password: isOAuth ? null : await HashPassword(data.password),
                type: data.userType,
                status: UserStatus.REGISTERING,
                settings: {
                    create: {}
                },
                addressInfo: {
                    create: {}
                },
                ...(data.profilePicture && {
                    profilePicture: {
                        create: {
                            type: 'IMAGE',
                            path: data.profilePicture,
                            access: 'PUBLIC',
                            name: 'profile picture',
                            extension: '.jpeg'
                        }
                    }
                }),
                ...(isOAuth && {
                    oauth: {
                        create: {
                            providerId: data.providerId,
                            type: data.providerType
                        }
                    }
                }),
                userInfo: { create: {} },
                userSubscription: {
                    create: { subscriptionPlanId: freemiumSubscriptionPlan.id }
                }
            },
            select: { id: true, email: true, type: true }
        });
        return user;
    }

    async ForgetPassword(data: ForgetPasswordRequestDTO): Promise<ForgetPasswordResponseDTO> {
        const user = await this._dbService.user.findFirst({
            where: {
                email: data.email.toLowerCase(),
                type: data.type
            },
            select: {
                id: true,
                firstName: true,
                email: true,
                oauth: { select: { id: true } }
            }
        });
        if (!user) {
            throw new BadRequestException(ExceptionMessage.user.notFound);
        }
        if (user.oauth?.id) {
            throw new ForbiddenException(ExceptionMessage.user.notAllowed);
        }

        const token = await this._tokenService.CreatePasswordToken({
            uuid: GenerateUUID(),
            userId: user.id,
            reason: TokenReason.FORGOT_PASSWORD,
            code: GenerateVerificationCode()
        });

        const emailPayload: SQSSendEmailArgs<ForgotPasswordEmailPayload> = {
            subject: 'Athlinc - OTP',
            template: EmailTemplates.FORGOT_PASSWORD,
            emails: [user.email],
            data: {
                userName: user.firstName,
                otp: token.code
            }
        };
        // this._queueService.EnqueueEmail(emailPayload);

        return { token: token.uuid };
    }

    async ForgetPasswordVerification(
        data: ForgetPasswordVerificationRequestDTO
    ): Promise<ForgetPasswordVerificationResponseDTO> {
        const token = await this._tokenService.GetToken({
            uuid: data.token,
            code: data.code,
            reason: TokenReason.FORGOT_PASSWORD
        });

        const resetToken = await this._tokenService.CreatePasswordToken({
            uuid: GenerateUUID(),
            userId: token.userId,
            reason: TokenReason.RESET_PASSWORD,
            code: token.code
        });

        /*deleting forgotPassword Token record*/
        await this._dbService.token.delete({
            where: {
                id: token.id
            }
        });

        return { token: resetToken.uuid };
    }

    async ChangePassword(
        currentUser: User,
        data: ChangePasswordRequestDTO,
        reqHeaders: any
    ): Promise<ResetPasswordResponseDTO> {
        if (data.newPassword == data.oldPassword) {
            throw new BadRequestException(ExceptionMessage.auth.samePassword);
        }

        const user = await this._dbService.user.findFirst({
            where: {
                id: currentUser.id
            },
            select: {
                id: true,
                email: true,
                password: true,
                type: true,
                firstName: true,
                oauth: { select: { id: true } }
            }
        });

        if (user.oauth?.id) {
            throw new ForbiddenException(ExceptionMessage.user.notAllowed);
        }

        const isPasswordMatched = await ComparePassword(data.oldPassword, user.password);

        if (!isPasswordMatched) {
            throw new ForbiddenException(ExceptionMessage.auth.wrongPassword);
        }

        const devices = await this._deviceService.FindByUserId(user.id);
        const promises = [];
        devices.map((device) => {
            if (device.authToken) promises.push(this._authService.DeleteSession(device.authToken));
        });
        await Promise.all(promises);
        await this._dbService.device.deleteMany({ where: { userId: user.id } });

        const authToken = await this._authService.CreateSession(
            currentUser.id,
            reqHeaders?.['user-agent']
        );

        const encryptedPassword = await HashPassword(data.newPassword);
        await this._dbService.user.update({
            where: { id: user.id },
            data: { password: encryptedPassword }
        });

        const emailPayload: SQSSendEmailArgs<ResetPasswordEmailPayload> = {
            subject: 'Athlinc - Password Updated',
            template: EmailTemplates.RESET_PASSWORD,
            emails: [user.email],
            data: {
                user: {
                    name: user.firstName,
                    type: user.type
                }
            }
        };
        // this._queueService.EnqueueEmail(emailPayload);

        return { token: authToken };
    }

    async ResetPassword(
        data: ResetPasswordRequestDTO,
        reqHeaders: any
    ): Promise<ResetPasswordResponseDTO> {
        const token = await this._tokenService.GetToken({
            uuid: data.token,
            reason: TokenReason.RESET_PASSWORD
        });

        /* deleting old session and creating new session */
        const devices = await this._deviceService.FindByUserId(token.userId);
        const promises = [];
        devices.map((device) => {
            if (device.authToken) promises.push(this._authService.DeleteSession(device.authToken));
        });
        await Promise.all(promises);
        await this._dbService.device.deleteMany({ where: { userId: token.userId } });

        const authToken = await this._authService.CreateSession(
            token.userId,
            reqHeaders?.['user-agent']
        );

        const user = await this._dbService.user.findFirst({
            where: {
                id: token.userId
            },
            select: {
                email: true,
                firstName: true,
                type: true
            }
        });

        /*deleting resetPassword Token record*/
        await this._dbService.token.delete({
            where: {
                id: token.id
            }
        });
        const encryptedPassword = await HashPassword(data.password);
        await this._dbService.user.update({
            where: { id: token.userId },
            data: { password: encryptedPassword }
        });

        const emailPayload: SQSSendEmailArgs<ResetPasswordEmailPayload> = {
            subject: 'Athlinc - Password Updated',
            template: EmailTemplates.RESET_PASSWORD,
            emails: [user.email],
            data: {
                user: {
                    name: user.firstName,
                    type: user.type
                }
            }
        };
        // this._queueService.EnqueueEmail(emailPayload);

        return { token: authToken };
    }

    async Logout(authToken: string): Promise<BooleanResponseDTO> {
        await this._authService.DeleteSession(authToken);
        return { data: true };
    }

    async GetMe(user: User, reqHeaders: any): Promise<GetMeResponseDTO> {
        const currentUser = await this._dbService.user.findUnique({
            where: { id: user.id },
            include: {
                settings: true,
                profilePicture: { select: { id: true, path: true, thumbPath: true } },
                addressInfo: true,
                userInfo: true,
                educationHistories: { where: { deletedAt: null } },
                workHistories: { where: { deletedAt: null } },
                achievements: { where: { deletedAt: null } },
                externalMediaSources: { where: { deletedAt: null } },
                certificates: {
                    where: { deletedAt: null },
                    select: {
                        id: true,
                        userId: true,
                        mediaId: true,
                        media: { select: { id: true, path: true, thumbPath: true, type: true } }
                    }
                },
                userSports: {
                    where: { deletedAt: null },
                    select: {
                        id: true,
                        sportId: true,
                        userId: true,
                        sportGender: true,
                        sport: { select: { id: true, title: true } }
                    }
                },
                userSubscription: {
                    include: {
                        subscriptionPlan: true
                    }
                }
            }
        });
        const notificationCount = await this._dbService.usersNotifications.count({
            where: {
                notification: {
                    type: 'USER_INTERACTION'
                },
                readStatus: 'UNREAD',
                receiverId: currentUser.id
            }
        });

        const userRes: UserResponseModel = ExcludeFields(
            { ...currentUser, notificationCount: notificationCount },
            ['password']
        );

        const promises = [];

        promises.push(
            this._dbService.userInteraction
                .count({
                    where: {
                        deletedAt: null,
                        objectUserId: currentUser.id,
                        type: UserInteractionType.LIKED
                    }
                })
                .then((res) => {
                    userRes.totalLikes = res;
                })
        );

        await Promise.all(promises);

        await this._authService.RefreshTokenTime(reqHeaders.authorization);

        return {
            user: userRes
        };
    }

    //FOR COACH
    async Find(data: FindUsersRequestDTO, currentUser: User): Promise<FindUsersResponseDTO> {
        let sports = undefined;
        if (currentUser.type === UserType.COACH) {
            sports = await this._dbService.userSport.findMany({
                where: {
                    userId: currentUser.id
                },
                select: {
                    sport: {
                        select: {
                            title: true
                        }
                    }
                }
            });
        }
        const prepareWhereParams: Record<UserType, Prisma.UserWhereInput> = {
            [UserType.ATHLETE]: {
                type: UserType.COACH,
                status: UserStatus.ACTIVE,
                ...(data?.isFavorite !== undefined
                    ? {
                          objectUserInteractions: {
                              some: {
                                  subjectUserId: currentUser.id,
                                  type: data.isFavorite
                                      ? UserInteractionType.LIKED
                                      : UserInteractionType.DISLIKED,
                                  deletedAt: null
                              }
                          }
                      }
                    : {
                          NOT: {
                              objectUserInteractions: {
                                  some: {
                                      subjectUserId: currentUser.id,
                                      type: UserInteractionType.DISLIKED,
                                      deletedAt: null
                                  }
                              }
                          }
                      }),
                ...(data.meAsFavorite !== undefined && {
                    subjectUserInteractions: {
                        some: {
                            objectUserId: currentUser.id,
                            type: data.meAsFavorite
                                ? UserInteractionType.LIKED
                                : UserInteractionType.DISLIKED,
                            deletedAt: null
                        }
                    }
                })
            },
            [UserType.COACH]: {
                type: UserType.ATHLETE,
                status: UserStatus.ACTIVE,
                ...(sports !== undefined && {
                    userSports: {
                        some: {
                            sport: {
                                title: {
                                    in: sports.map((item) => item?.sport?.title)
                                }
                            }
                        }
                    }
                }),
                ...(data?.isFavorite !== undefined
                    ? {
                          objectUserInteractions: {
                              some: {
                                  subjectUserId: currentUser.id,
                                  type: data.isFavorite
                                      ? UserInteractionType.LIKED
                                      : UserInteractionType.DISLIKED,
                                  deletedAt: null
                              }
                          }
                      }
                    : {
                          NOT: {
                              OR: [
                                  {
                                      objectUserInteractions: {
                                          some: {
                                              subjectUserId: currentUser.id,
                                              type: UserInteractionType.DISLIKED,
                                              deletedAt: null
                                          }
                                      }
                                  },
                                  {
                                      objectUserInteractions: {
                                          some: {
                                              subjectUserId: currentUser.id,
                                              type: UserInteractionType.LIKED,
                                              deletedAt: null
                                          }
                                      }
                                  }
                              ]
                          }
                      }),
                ...(data.meAsFavorite !== undefined && {
                    subjectUserInteractions: {
                        some: {
                            objectUserId: currentUser.id,
                            type: data.meAsFavorite
                                ? UserInteractionType.LIKED
                                : UserInteractionType.DISLIKED,
                            deletedAt: null
                        }
                    }
                })
            },
            [UserType.ADMIN]: {
                ...(!!data.type && { type: data.type }),
                ...(!!data.status?.length && { status: { in: data.status } }),
                ...(data.subscriptionPlanId && {
                    userSubscription: {
                        deletedAt: null,
                        subscriptionPlanId: data.subscriptionPlanId
                    }
                })
            }
        };
        const where: Prisma.UserWhereInput = prepareWhereParams[currentUser.type];
        where.AND = [];
        if (data.search) {
            where.AND.push({
                OR: [
                    {
                        firstName: { contains: data.search, mode: Prisma.QueryMode.insensitive }
                    },
                    {
                        lastName: { contains: data.search, mode: Prisma.QueryMode.insensitive }
                    }
                ]
            });
        }
        if (data.sportName) {
            where.AND.push({
                userSports: {
                    some: {
                        sport: {
                            title: { contains: data.sportName, mode: Prisma.QueryMode.insensitive },
                            deletedAt: null
                        },
                        deletedAt: null
                    }
                }
            });
        }
        if (data.schoolName) {
            where.AND.push({
                educationHistories: {
                    some: {
                        institute: {
                            contains: data.schoolName,
                            mode: Prisma.QueryMode.insensitive
                        },
                        deletedAt: null
                    }
                }
            });
        }
        if (data.address) {
            where.AND.push({
                addressInfo: {
                    address: {
                        contains: data.address,
                        mode: Prisma.QueryMode.insensitive
                    },
                    deletedAt: null
                }
            });
        }
        if (data.coachingExperience) {
            where.AND.push({
                userInfo: {
                    coachingExperience: {
                        gte: data.coachingExperience
                    },
                    deletedAt: null
                }
            });
        }
        // const pagination = GetPaginationOptions(data);
        // const order = GetOrderOptions(data);

        let limit = undefined; // Default: no limit
        let redisKey = undefined;
        let sortOrder: Prisma.SortOrder = 'desc';

        const subscriptionStatus = await this.checkSubscriptionStatus(currentUser.id);
        if (currentUser.type === UserType.ATHLETE) {
            if (subscriptionStatus === 'FREE') {
                const totalCoaches = await this._dbService.user.count({ where });
                //limiting to 50% of total coaches
                limit = Math.floor(totalCoaches * 0.5);
                sortOrder = 'asc';
                if (!data.isFavorite && !data.meAsFavorite) {
                    redisKey = `freemium_user_ids:${currentUser.id}`;
                }
            }
        }

        const users = await this._dbService.user.findMany({
            include: {
                profilePicture: true,
                addressInfo: true,
                userInfo: true,
                userSubscription: {
                    select: {
                        id: true,
                        userId: true,
                        subscriptionPlanId: true,
                        expiredAt: true,
                        subscriptionPlan: { select: { type: true } }
                    }
                }
            },
            where,
            ...(data?.isFavorite === true ? { take: undefined } : { take: limit }), // ...pagination,

            orderBy:
                currentUser.type !== UserType.ADMIN
                    ? [{ userSubscription: { subscriptionPlan: { type: 'asc' } } }, { id: 'desc' }]
                    : // :order
                      { createdAt: sortOrder }
        });
        let freemiumCoachesIds: number[] = users.map((item) => item.id);

        if (redisKey) {
            await this._cacheService.Set(redisKey, freemiumCoachesIds, 3600);
        }

        const usersRes: UserDetailsResponseModel[] = users.map((userObj) => {
            ExcludeFields(userObj, ['password']);
            return userObj;
        });

        const count = await this._dbService.user.count({
            where
        });

        const promises = [];

        for (let user of usersRes) {
            user.isLiked = false;
            user.isDisliked = false;

            promises.push(
                this._dbService.userInteraction
                    .findMany({
                        where: {
                            deletedAt: null,
                            subjectUserId: currentUser.id,
                            objectUserId: user.id
                        }
                    })
                    .then((res: UserInteraction[]) => {
                        res.map((item) => {
                            if (item.type === UserInteractionType.LIKED) {
                                user.isLiked = true;
                            } else if (item.type === UserInteractionType.DISLIKED) {
                                user.isDisliked = true;
                            }
                        });
                    })
            );
        }

        await Promise.all(promises);

        return { data: usersRes, count };
    }

    async AthleteHome(currentUser: User) {
        const userSports = await this._dbService.userSport.findMany({
            where: {
                userId: currentUser.id
            },
            select: {
                sport: {
                    select: {
                        title: true
                    }
                }
            }
        });

        let where: Prisma.UserWhereInput = {
            type: UserType.COACH,
            status: UserStatus.ACTIVE,
            isBlocked: false,
            userSports: {
                some: {
                    sport: {
                        title: {
                            in: userSports.map((sport) => sport.sport.title)
                        }
                    }
                }
            },
            NOT: {
                OR: [
                    {
                        objectUserInteractions: {
                            some: {
                                type: UserInteractionType.DISLIKED,
                                subjectUserId: currentUser.id,
                                deletedAt: null
                            }
                        }
                    },
                    {
                        objectUserInteractions: {
                            some: {
                                type: UserInteractionType.LIKED,
                                subjectUserId: currentUser.id,
                                deletedAt: null
                            }
                        }
                    }
                ]
            }
        };

        let limit = undefined;
        let redisKey = undefined;
        let freeCoachIds: number[] = [];
        let sortOrder: Prisma.SortOrder = 'desc';

        const subscriptionStatus = await this.checkSubscriptionStatus(currentUser.id);

        if (currentUser.type == UserType.ATHLETE && subscriptionStatus === 'FREE') {
            redisKey = `freemium_user_ids:${currentUser.id}`;
            freeCoachIds = (await this._cacheService.Get(redisKey)) || [];
            if (freeCoachIds.length) {
                where.id = {
                    in: freeCoachIds
                };
            } else {
                const totalCoaches = await this._dbService.user.count({ where });
                limit = Math.floor(totalCoaches * 0.5);
                sortOrder = 'asc';
            }
        }

        const users = await this._dbService.user.findMany({
            include: {
                profilePicture: true,
                addressInfo: true,
                userInfo: true,
                userSubscription: {
                    select: {
                        id: true,
                        userId: true,
                        subscriptionPlanId: true,
                        expiredAt: true,
                        subscriptionPlan: { select: { type: true } }
                    }
                }
            },
            orderBy: {
                createdAt: sortOrder
            },
            where,
            ...(limit && { take: limit })
        });

        const usersRes: UserDetailsResponseModel[] = users.map((userObj) => {
            ExcludeFields(userObj, ['password']);
            return userObj;
        });

        if (
            currentUser.type == UserType.ATHLETE &&
            subscriptionStatus === 'FREE' &&
            !freeCoachIds.length
        ) {
            const coachIds = users.map((user) => user.id);
            await this._cacheService.Set(redisKey, coachIds, 120);
        }

        const promises = usersRes.map(async (user) => {
            const interaction = await this._dbService.userInteraction.findFirst({
                where: {
                    type: UserInteractionType.LIKED,
                    subjectUserId: currentUser.id,
                    objectUserId: user.id,
                    deletedAt: null
                }
            });
            user.isLiked = !!interaction;
        });
        await Promise.all(promises);

        return { data: usersRes, count: 0 };
    }

    async UserInteractions(data: UserInteractionsDTO, currentUser: User) {
        let prepareWhereArgs: Record<UserType, Prisma.UserWhereInput> = {
            [UserType.ATHLETE]: {
                type: UserType.COACH,
                status: UserStatus.ACTIVE,
                isBlocked: false,
                ...(data?.isFavourite && {
                    objectUserInteractions: {
                        some: {
                            subjectUserId: currentUser.id,
                            deletedAt: null,
                            type: UserInteractionType.LIKED
                        }
                    }
                }),
                ...(data?.meAsFavourite && {
                    subjectUserInteractions: {
                        some: {
                            objectUserId: currentUser.id,
                            deletedAt: null,
                            type: UserInteractionType.LIKED
                        }
                    }
                }),
                ...(data?.dislike && {
                    objectUserInteractions: {
                        some: {
                            subjectUserId: currentUser.id,
                            deletedAt: null,
                            type: UserInteractionType.DISLIKED
                        }
                    }
                })
            },
            [UserType.COACH]: {
                type: UserType.ATHLETE,
                status: UserStatus.ACTIVE,
                isBlocked: false,
                ...(data?.isFavourite && {
                    objectUserInteractions: {
                        some: {
                            subjectUserId: currentUser.id,
                            deletedAt: null,
                            type: UserInteractionType.LIKED
                        }
                    }
                }),
                ...(data?.meAsFavourite && {
                    subjectUserInteractions: {
                        some: {
                            objectUserId: currentUser.id,
                            deletedAt: null,
                            type: UserInteractionType.LIKED
                        }
                    }
                }),
                ...(data?.dislike && {
                    objectUserInteractions: {
                        some: {
                            subjectUserId: currentUser.id,
                            deletedAt: null,
                            type: UserInteractionType.DISLIKED
                        }
                    }
                })
            },
            [UserType.ADMIN]: {}
        };

        let where = prepareWhereArgs[currentUser.type];
        const users = await this._dbService.user.findMany({
            include: {
                profilePicture: true,
                addressInfo: true,
                userInfo: true,
                userSubscription: {
                    select: {
                        id: true,
                        userId: true,
                        subscriptionPlanId: true,
                        expiredAt: true,
                        subscriptionPlan: { select: { type: true } }
                    }
                }
            },
            where
        });

        const usersRes = users.map((userObj) => {
            ExcludeFields(userObj, ['password']);
            return {
                ...userObj,
                isLiked: data?.isFavourite || false,
                isDisliked: data?.dislike || false
            };
        });

        return {
            data: usersRes,
            count: users.length
        };
    }

    //NEED TO REMAKE THIS API
    async CoachHome(currentUser: User) {
        let where: Prisma.UserWhereInput = {
            type: UserType.ATHLETE,
            status: 'ACTIVE',
            NOT: {
                objectUserInteractions: {
                    some: {
                        type: UserInteractionType.DISLIKED,
                        subjectUserId: currentUser.id,
                        deletedAt: null
                    }
                }
            }
        };

        // const users = await this._dbService.user.fin;
    }

    async Search(data: FindUsersRequestDTO, currentUser: User) {
        let freeCoachIds = [];
        let redisKey = undefined;

        if (currentUser.type === UserType.ATHLETE) {
            const subscriptionStatus = await this.checkSubscriptionStatus(currentUser.id);
            if (subscriptionStatus === 'FREE') {
                redisKey = `freemium_user_ids:${currentUser.id}`;
                freeCoachIds = (await this._cacheService.Get(redisKey)) || [];
            }
        }

        const prepareWhereParams: Record<UserType, Prisma.UserWhereInput> = {
            [UserType.ATHLETE]: {
                type: UserType.COACH,
                status: UserStatus.ACTIVE,
                isBlocked: false,
                ...(redisKey && { id: { in: freeCoachIds } })
            },
            [UserType.COACH]: {
                type: UserType.ATHLETE,
                status: UserStatus.ACTIVE,
                isBlocked: false
            },
            [UserType.ADMIN]: {}
        };

        const where: Prisma.UserWhereInput = prepareWhereParams[currentUser.type];
        where.AND = [];

        if (data.search) {
            const searchTerms = data.search.split(' ').filter(Boolean);
            if (searchTerms.length > 1) {
                where.AND.push({
                    AND: [
                        {
                            firstName: {
                                contains: searchTerms[0],
                                mode: Prisma.QueryMode.insensitive
                            }
                        },
                        {
                            lastName: {
                                contains: searchTerms[1],
                                mode: Prisma.QueryMode.insensitive
                            }
                        }
                    ]
                });
            } else {
                where.AND.push({
                    OR: [
                        {
                            firstName: { contains: data.search, mode: Prisma.QueryMode.insensitive }
                        },
                        { lastName: { contains: data.search, mode: Prisma.QueryMode.insensitive } }
                    ]
                });
            }
        }

        if (data.sportName) {
            where.AND.push({
                userSports: {
                    some: {
                        sport: {
                            title: { contains: data.sportName, mode: Prisma.QueryMode.insensitive },
                            deletedAt: null
                        },
                        deletedAt: null
                    }
                }
            });
        }

        if (data.address) {
            where.AND.push({
                addressInfo: {
                    OR: [
                        { address: { contains: data.address, mode: Prisma.QueryMode.insensitive } },
                        { city: { contains: data.address, mode: Prisma.QueryMode.insensitive } },
                        { state: { contains: data.address, mode: Prisma.QueryMode.insensitive } }
                    ]
                }
            });
        }

        if (data.schoolName) {
            where.AND.push({
                educationHistories: {
                    some: {
                        institute: {
                            contains: data.schoolName,
                            mode: Prisma.QueryMode.insensitive
                        },
                        deletedAt: null
                    }
                }
            });
        }

        if (data.coachingExperience) {
            where.AND.push({
                userInfo: {
                    coachingExperience: { equals: data.coachingExperience },
                    deletedAt: null
                }
            });
        }

        const count = await this._dbService.user.count({ where });

        const users = await this._dbService.user.findMany({
            include: {
                profilePicture: true,
                addressInfo: true,
                userInfo: true,
                userSubscription: {
                    select: {
                        id: true,
                        userId: true,
                        subscriptionPlanId: true,
                        expiredAt: true,
                        subscriptionPlan: { select: { type: true } }
                    }
                }
            },
            where,
            orderBy: { createdAt: 'desc' }
        });

        const usersRes: UserDetailsResponseModel[] = users.map((userObj) => {
            ExcludeFields(userObj, ['password']);
            return { ...userObj, isLiked: false, isDisliked: false };
        });

        const interactions = await this._dbService.userInteraction.findMany({
            where: {
                deletedAt: null,
                subjectUserId: currentUser.id,
                objectUserId: { in: usersRes.map((user) => user.id) }
            }
        });

        interactions.forEach((item) => {
            const user = usersRes.find((user) => user.id === item.objectUserId);
            if (user) {
                if (item.type === UserInteractionType.LIKED) user.isLiked = true;
                if (item.type === UserInteractionType.DISLIKED) user.isDisliked = true;
            }
        });

        return { data: usersRes, count };
    }

    async Get(id: number, currentUser: User): Promise<GetUserByIdResponseDTO> {
        const basicUser = await this._dbService.user.findFirst({
            where: {
                id,
                ...(currentUser.type !== UserType.ADMIN &&
                    currentUser.id !== id && {
                        status: UserStatus.ACTIVE
                    }),
                ...(currentUser.type !== UserType.ADMIN && {
                    type: {
                        in: [UserType.ATHLETE, UserType.COACH]
                    }
                })
            },
            select: {
                id: true
            }
        });
        if (!basicUser) {
            throw new NotFoundException(ExceptionMessage.user.notFound);
        }

        const user = await this._dbService.user.findFirst({
            where: { id },
            include: {
                profilePicture: { select: { id: true, path: true, thumbPath: true } },
                addressInfo: true,
                userInfo: true,
                educationHistories: { where: { deletedAt: null } },
                workHistories: { where: { deletedAt: null } },
                achievements: { where: { deletedAt: null } },
                externalMediaSources: { where: { deletedAt: null } },
                certificates: {
                    where: { deletedAt: null },
                    select: {
                        id: true,
                        userId: true,
                        mediaId: true,
                        media: { select: { id: true, path: true, thumbPath: true, type: true } }
                    }
                },
                userSports: {
                    where: { deletedAt: null },
                    select: {
                        id: true,
                        sportId: true,
                        userId: true,
                        sportGender: true,
                        sport: { select: { id: true, title: true } }
                    }
                },
                userSubscription: {
                    select: {
                        id: true,
                        userId: true,
                        subscriptionPlanId: true,
                        expiredAt: true,
                        subscriptionPlan: { select: { type: true } }
                    }
                }
            }
        });
        if (!user) {
            throw new NotFoundException(ExceptionMessage.user.notFound);
        }

        ExcludeFields(user, ['password']);
        const response: GetUserByIdResponseDTO = { ...user };

        response.isLiked = false;
        response.isDisliked = false;

        const promises = [];

        promises.push(
            this._dbService.userInteraction
                .findMany({
                    where: {
                        deletedAt: null,
                        subjectUserId: currentUser.id,
                        objectUserId: user.id
                    }
                })
                .then((res: UserInteraction[]) => {
                    res.map((item) => {
                        if (item.type === UserInteractionType.LIKED) {
                            response.isLiked = true;
                        } else if (item.type === UserInteractionType.DISLIKED) {
                            response.isDisliked = true;
                        }
                    });
                })
        );

        await Promise.all(promises);
        const canChat = await this._dbService.$queryRaw`
        SELECT 
        (COUNT(*) = 2) as "exists" 
        FROM "UserInteraction"
        WHERE 
        ("objectUserId" = ${user.id} AND "subjectUserId" = ${currentUser.id})
        OR 
        ("objectUserId" = ${currentUser.id} AND "subjectUserId" = ${user.id});
        `;
        response.canChat = canChat[0]?.exists ?? false;
        return response;
    }

    async UpdateUser(
        userId: number,
        data: UpdateUserRequestDTO,
        currentUser: User
    ): Promise<BooleanResponseDTO> {
        if (currentUser.id !== userId) {
            throw new ForbiddenException(ExceptionMessage.user.notAllowed);
        }

        const user = await this._dbService.user.findFirst({
            where: {
                id: userId
            },
            select: {
                id: true,
                type: true,
                status: true,
                firstName: true,
                email: true,
                meta: true
            }
        });
        if (!user) {
            throw new NotFoundException(ExceptionMessage.user.notFound);
        }

        if (data?.athleteDetails?.externalMediaSources) {
            const [currentExternalLinksCount, subscriptionStatus] = await Promise.all([
                this._dbService.externalMediaSource.count({ where: { userId } }),
                this.checkSubscriptionStatus(userId)
            ]);
            const newExternalLinksCount = data.athleteDetails.externalMediaSources.length;
            if (
                subscriptionStatus === 'FREE' &&
                currentExternalLinksCount +
                    newExternalLinksCount -
                    (data?.athleteDetails?.DeletedexternalMediaSources?.length || 0) >
                    1
            ) {
                throw new BadRequestException('Only 1 external linkage is allowed in free mode');
            }
        }

        // if (data.email) {
        //     const userWithEmail = await this._dbService.user.findFirst({
        //         where: {
        //             email: data.email
        //         },
        //         select: {
        //             id: true
        //         }
        //     });
        //     if (userWithEmail && userWithEmail.id !== user.id) {
        //         throw new ForbiddenException(ExceptionMessage.user.emailAlreadyExist);
        //     }
        // }

        if (data.profilePictureId) {
            const media = await this._dbService.media.findUnique({
                where: { id: data.profilePictureId },
                select: { id: true, userId: true, type: true, status: true }
            });
            if (!media || media.userId !== currentUser.id || media.status !== MediaStatus.READY) {
                throw new NotFoundException(ExceptionMessage.media.notFound);
            }
            // else if (media.type !== MediaType.IMAGE) {
            //     throw new ForbiddenException(ExceptionMessage.media.notSupported);
            // }
        }

        let updateCertificateParams: Prisma.CertificateCreateManyInput[] = null;
        if (
            data.coachDetails?.certificateIds &&
            data.coachDetails?.certificateIds?.length &&
            user.type === UserType.COACH
        ) {
            const mediaCount = await this._dbService.media.count({
                where: {
                    id: {
                        in: data.coachDetails.certificateIds
                    },
                    userId: currentUser.id,
                    status: MediaStatus.READY,
                    type: { in: [MediaType.DOCUMENT, MediaType.IMAGE] }
                }
            });
            if (mediaCount !== data.coachDetails.certificateIds.length) {
                throw new NotFoundException(ExceptionMessage.media.notFound);
            }
            updateCertificateParams = data.coachDetails.certificateIds.map((certificateId) => {
                return {
                    mediaId: certificateId,
                    userId: user.id
                };
            });
        }

        let updateEducationParams: Prisma.EducationHistoryCreateManyInput[] = null;
        if (data.educationHistory && data.educationHistory?.length) {
            updateEducationParams = data.educationHistory.map((item) => {
                return {
                    ...(item.degree && { degree: item.degree }),
                    institute: item.institute,
                    ...(item.year && { year: item.year }),
                    ...(item.gpa && { gpa: item.gpa }),
                    userId: user.id
                };
            });
        }

        let updateWorkParams: Prisma.WorkHistoryCreateManyInput[] = null;
        if (data.coachDetails?.workHistory && data.coachDetails?.workHistory?.length) {
            updateWorkParams = data.coachDetails.workHistory.map((item) => {
                return {
                    companyName: item.companyName,
                    year: item.year,
                    userId: user.id
                };
            });
        }

        let updateAchievementParams: Prisma.AchievementCreateManyInput[] = null;
        if (data.athleteDetails?.achievements && data.athleteDetails?.achievements?.length) {
            updateAchievementParams = data.athleteDetails.achievements.map((item) => {
                return {
                    name: item.name,
                    year: item.year,
                    userId: user.id
                };
            });
        }

        let updateSportParams: Prisma.UserSportCreateManyInput[] = null;
        if (data.sports && data.sports?.length) {
            const sportIds: number[] = [];
            updateSportParams = data.sports.map((item) => {
                sportIds.push(item.sportId);
                return {
                    sportId: item.sportId,
                    sportGender: item.sportGender,
                    userId: user.id
                };
            });
            const sportCount = await this._dbService.sport.count({
                where: { id: { in: sportIds } }
            });
            if (sportCount !== sportIds.length) {
                throw new NotFoundException(ExceptionMessage.sport.notFound);
            }
        }

        let updateMediaSourceParams: Prisma.ExternalMediaSourceCreateManyInput[] = null;
        if (
            data.athleteDetails?.externalMediaSources &&
            data.athleteDetails?.externalMediaSources?.length
        ) {
            //if length is there means he want to delete some and keep some
            await this._dbService.externalMediaSource.deleteMany({
                where: {
                    userId: user.id
                }
            });
            updateMediaSourceParams = data.athleteDetails.externalMediaSources.map((item) => {
                return {
                    link: item.link,
                    userId: user.id
                };
            });
            await this._dbService.externalMediaSource.createMany({
                data: updateMediaSourceParams
            });
        } else {
            //If array is empty means he wants to delete all the links
            await this._dbService.externalMediaSource.deleteMany({
                where: {
                    userId: user.id
                }
            });
        }

        const updateUserCommonParams: Prisma.UserUncheckedUpdateInput = {
            ...(!!data.profilePictureId && { profilePictureId: data.profilePictureId }),
            // ...(!!data.email && { email: data.email }),
            ...(!!data.firstName && { firstName: data.firstName }),
            ...(!!data.lastName && { lastName: data.lastName }),
            ...(!!data.about && { about: data.about }),
            ...(!!data.phone && { phone: data.phone }),
            ...(data.age && { age: data.age }),
            ...(!!data.gender &&
                (user.status === UserStatus.REGISTERING ||
                    user.status === UserStatus.PENDING ||
                    user.status === UserStatus.INACTIVE) && {
                    gender: data.gender
                }),
            ...(!!data.height && { height: data.height }),
            ...(!!data.weight && { weight: data.weight })
        };

        const userUpdateSpecificParams: Record<UserType, Prisma.UserUncheckedUpdateInput> = {
            [UserType.ATHLETE]: {
                ...(!!data?.sendForApproval &&
                    (user.status === UserStatus.REGISTERING ||
                        user.status === UserStatus.INACTIVE) && {
                        status: UserStatus.ACTIVE
                    })
            },
            [UserType.COACH]: {
                ...(!!data?.sendForApproval &&
                    (user.status === UserStatus.REGISTERING ||
                        user.status === UserStatus.INACTIVE) && {
                        status: UserStatus.ACTIVE
                    })
            },
            [UserType.ADMIN]: {}
        };

        const prismaQueries: Prisma.PrismaPromise<any>[] = [];

        prismaQueries.push(
            this._dbService.user.update({
                where: { id: user.id },
                data: {
                    ...updateUserCommonParams,
                    ...userUpdateSpecificParams[user.type]
                }
            })
        );

        prismaQueries.push(
            this._dbService.userInfo.update({
                where: { userId: user.id },
                data: {
                    ...(data.coachDetails?.certification && {
                        certification: data.coachDetails?.certification
                    }),
                    ...(data.coachDetails?.coachingExperience && {
                        coachingExperience: data.coachDetails?.coachingExperience
                    }),
                    ...(data.coachDetails?.sportPosition && {
                        sportPosition: data.coachDetails?.sportPosition
                    }),
                    ...(data.athleteDetails?.currentTeam && {
                        currentTeam: data.athleteDetails?.currentTeam
                    }),
                    ...(data.athleteDetails?.previousTeam && {
                        previousTeam: data.athleteDetails?.previousTeam
                    }),
                    ...(data.athleteDetails?.coach && { coach: data.athleteDetails?.coach }),
                    ...(data.athleteDetails?.sportPosition && {
                        sportPosition: data.athleteDetails?.sportPosition
                    }),
                    ...(data.athleteDetails?.grade && {
                        grade: data.athleteDetails?.grade
                    })
                }
            })
        );

        prismaQueries.push(
            this._dbService.addressInfo.update({
                where: { userId: user.id },
                data: {
                    ...(data.address && { address: data.address }),
                    ...(data.state && { state: data.state }),
                    ...(data.country && { country: data.country }),
                    ...(data.city && { city: data.city }),
                    ...(data.zipCode && { zipCode: data.zipCode }),
                    ...(data.longitude && { longitude: data.longitude }),
                    ...(data.latitude && { latitude: data.latitude })
                }
            })
        );

        if (data.athleteDetails && user.type === UserType.ATHLETE) {
            if (data.athleteDetails?.achievements) {
                prismaQueries.push(
                    this._dbService.achievement.deleteMany({ where: { userId: user.id } })
                );
                if (updateAchievementParams) {
                    prismaQueries.push(
                        this._dbService.achievement.createMany({
                            data: updateAchievementParams
                        })
                    );
                }
            }
            // if (data.athleteDetails?.externalMediaSources) {
            //     prismaQueries.push(
            //         this._dbService.externalMediaSource.deleteMany({ where: { userId: user.id } })
            //     );
            //     if (updateMediaSourceParams) {
            //         prismaQueries.push(
            //             this._dbService.externalMediaSource.createMany({
            //                 data: updateMediaSourceParams
            //             })
            //         );
            //     }
            // }
        }
        if (data.coachDetails && user.type === UserType.COACH) {
            if (data.coachDetails?.workHistory) {
                prismaQueries.push(
                    this._dbService.workHistory.deleteMany({
                        where: { userId: user.id }
                    })
                );
                if (updateWorkParams) {
                    prismaQueries.push(
                        this._dbService.workHistory.createMany({
                            data: updateWorkParams
                        })
                    );
                }
            }
            if (data.coachDetails?.certificateIds) {
                prismaQueries.push(
                    this._dbService.certificate.deleteMany({
                        where: { userId: user.id }
                    })
                );
                if (updateCertificateParams) {
                    prismaQueries.push(
                        this._dbService.certificate.createMany({
                            data: updateCertificateParams
                        })
                    );
                }
            }
        }
        if (data.sports) {
            prismaQueries.push(
                this._dbService.userSport.deleteMany({ where: { userId: user.id } })
            );
            if (updateSportParams) {
                prismaQueries.push(
                    this._dbService.userSport.createMany({
                        data: updateSportParams
                    })
                );
            }
        }
        if (data.educationHistory) {
            prismaQueries.push(
                this._dbService.educationHistory.deleteMany({ where: { userId: user.id } })
            );
            if (updateEducationParams) {
                prismaQueries.push(
                    this._dbService.educationHistory.createMany({
                        data: updateEducationParams
                    })
                );
            }
        }
        await this._dbService.$transaction(prismaQueries);

        return {
            data: true
        };
    }

    async ChangeUserStatus(
        id: number,
        data: ChangeUserStatusRequestDTO,
        currentUser: User
    ): Promise<BooleanResponseDTO> {
        const user = await this._dbService.user.findFirst({
            where: {
                id: id,
                NOT: {
                    type: UserType.ADMIN
                }
            },
            select: {
                id: true,
                type: true,
                firstName: true,
                email: true,
                meta: true,
                status: true
            }
        });
        if (!user) {
            throw new NotFoundException(ExceptionMessage.user.notFound);
        }

        this._checkAllowedUserStatusChangeOperation(user.status, data.status, user.type);

        const userMeta: TUserMeta = { ...(user.meta as any), statusReason: data.reason };

        await this._dbService.user.update({
            where: { id },
            data: {
                status: data.status,
                meta: userMeta
            }
        });

        return {
            data: true
        };
    }

    async UpdateUserSettings(
        userId: number,
        data: UpdateUserSettingsRequestDTO
    ): Promise<BooleanResponseDTO> {
        const userSettings = await this._dbService.userSettings.update({
            where: {
                userId
            },
            data: {
                ...(data.hasOwnProperty('notificationsEnabled') && {
                    notificationsEnabled: data.notificationsEnabled
                })
            }
        });
        return {
            data: true
        };
    }

    async DeleteUser(userId: number, currentUser: User): Promise<BooleanResponseDTO> {
        const isHimself = currentUser.id === userId;
        if (!isHimself) {
            throw new ForbiddenException(ExceptionMessage.user.notAllowed);
        }
        const user = await this._dbService.user.findFirst({
            where: {
                id: userId,
                type: { not: UserType.ADMIN }
            },
            select: {
                id: true,
                type: true,
                firstName: true
            }
        });
        if (!user) {
            throw new NotFoundException(ExceptionMessage.user.notFound);
        }

        const prismaQueries: Array<Prisma.PrismaPromise<any>> = [];

        prismaQueries.push(this._dbService.user.delete({ where: { id: user.id } }));
        prismaQueries.push(this._dbService.userOAuth.deleteMany({ where: { userId: user.id } }));
        prismaQueries.push(this._dbService.userSettings.deleteMany({ where: { userId: user.id } }));
        prismaQueries.push(this._dbService.device.deleteMany({ where: { userId: user.id } }));

        // prismaQueries.push(
        //     this._dbService.media.updateMany({
        //         where: { userId: user.id },
        //         data: { status: MediaStatus.STALE }
        //     })
        // );

        try {
            await this._dbService.$transaction(prismaQueries);
        } catch (err) {
            Logger.Error(err, '[USER]');
            throw new FatalErrorException(ExceptionMessage.user.unknownError);
        }

        return {
            data: true
        };
    }

    async ToggleBlockUser(
        id: number,
        currentUser: User,
        block: boolean
    ): Promise<BooleanResponseDTO> {
        const isHimself = currentUser.id === id;
        if (isHimself) {
            throw new ForbiddenException(ExceptionMessage.user.notAllowed);
        }
        const user = await this._dbService.user.findFirst({
            where: { id, type: { not: UserType.ADMIN } },
            select: { id: true }
        });
        if (!user) {
            throw new NotFoundException(ExceptionMessage.user.notFound);
        }
        const existingRelationship = await this._dbService.userRelationship.findFirst({
            where: {
                OR: [
                    { subjectUserId: currentUser.id, objectUserId: user.id },
                    { subjectUserId: user.id, objectUserId: currentUser.id }
                ]
            }
        });

        if (block) {
            if (!existingRelationship) {
                await this._dbService.userRelationship.create({
                    data: {
                        subjectUserId: currentUser.id,
                        objectUserId: user.id,
                        status: UserRelationshipStatus.BLOCKED
                    }
                });
            } else {
                if (existingRelationship.status === UserRelationshipStatus.BLOCKED) {
                    if (existingRelationship.subjectUserId === currentUser.id) {
                        throw new BadRequestException(ExceptionMessage.user.alreadyBlocked);
                    }
                    throw new ForbiddenException(ExceptionMessage.user.notAllowed);
                }
                await this._dbService.userRelationship.update({
                    where: { id: existingRelationship.id },
                    data: {
                        subjectUserId: currentUser.id,
                        objectUserId: user.id,
                        status: UserRelationshipStatus.BLOCKED
                    }
                });
            }
        } else {
            if (
                existingRelationship?.status !== UserRelationshipStatus.BLOCKED ||
                existingRelationship?.subjectUserId !== currentUser.id
            ) {
                throw new ForbiddenException(ExceptionMessage.user.notAllowed);
            }
            await this._dbService
                .$executeRaw`${Prisma.sql`DELETE FROM "UserRelationship" WHERE id = ${existingRelationship.id}`}`;
        }

        const existingChat = await this._chatService.FindChatBetweenUsers(currentUser.id, user.id);
        if (existingChat?.id) {
            await this._chatService.BlockChat(existingChat.id, currentUser.id, block);
        }

        return { data: true };
    }

    async InteractUser(
        userId: number,
        currentUser: User,
        data: InteractUserRequestDTO
    ): Promise<BooleanResponseDTO> {
        const isHimself = currentUser.id === userId;
        if (isHimself) {
            throw new ForbiddenException(ExceptionMessage.user.notAllowed);
        }
        const user = await this._dbService.user.findFirst({
            where: { id: userId, type: { not: UserType.ADMIN } },
            select: { id: true }
        });
        if (!user) {
            throw new NotFoundException(ExceptionMessage.user.notFound);
        }

        const existingInteraction = await this._dbService.userInteraction.findFirst({
            where: {
                subjectUserId: currentUser.id,
                objectUserId: user.id
            }
        });

        if (!existingInteraction) {
            if (currentUser.type == UserType.ATHLETE && data.type == UserInteractionType.LIKED) {
                const isUserInFreeMode = await this.checkSubscriptionStatus(currentUser.id);
                if (isUserInFreeMode == 'FREE') {
                    const todayStart = new Date();
                    todayStart.setHours(0, 0, 0, 0);

                    const todayEnd = new Date();
                    todayEnd.setHours(23, 59, 59, 999);

                    const dailyLikeCount = await this._dbService.userInteraction.count({
                        where: {
                            subjectUserId: currentUser.id,
                            type: UserInteractionType.LIKED,
                            deletedAt: null,
                            createdAt: { gte: todayStart, lte: todayEnd }
                        }
                    });
                    if (dailyLikeCount == 5) {
                        throw new ForbiddenException(
                            'Your Daily Like Limit Has Exceeded for free mode'
                        );
                    }
                }
            }

            const like: Prisma.UserInteractionGetPayload<{
                include: { subjectUser: true; objectUser: true };
            }> = await this._dbService.userInteraction.create({
                data: { subjectUserId: currentUser.id, objectUserId: userId, type: data.type },
                include: {
                    subjectUser: true,
                    objectUser: true
                }
            });
            await this._notificationService.constructLikeNotification(like);
        } else if (existingInteraction) {
            if (
                existingInteraction.type === UserInteractionType.LIKED &&
                data.type === UserInteractionType.LIKED
            ) {
                await this._dbService
                    .$executeRaw`${Prisma.sql`DELETE FROM "UserInteraction" WHERE id = ${existingInteraction.id}`}`;
            } else if (
                existingInteraction.type === UserInteractionType.DISLIKED &&
                data.type === UserInteractionType.DISLIKED
            ) {
                await this._dbService
                    .$executeRaw`${Prisma.sql`DELETE FROM "UserInteraction" WHERE id = ${existingInteraction.id}`}`;
            } else {
                await this._dbService.userInteraction.update({
                    where: { id: existingInteraction.id },
                    data: { type: data.type }
                });
            }
        }
        return { data: true };
    }
}
