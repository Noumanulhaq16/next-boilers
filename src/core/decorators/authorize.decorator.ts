import { applyDecorators, SetMetadata } from '@nestjs/common';
import { ApiSecurity } from '@nestjs/swagger';
import { UserStatus, UserType } from '@prisma/client';

export const Authorized = (
    roleOrRoles?: UserType | Array<UserType>,
    userStatusOrStatuses?: UserStatus | Array<UserStatus> | 'ALL'
) => {
    let authorizedRoles: UserType[] = [];
    let authorizedStatuses: UserStatus[] = [];
    if (roleOrRoles) authorizedRoles = Array.isArray(roleOrRoles) ? roleOrRoles : [roleOrRoles];
    if (userStatusOrStatuses) {
        if (userStatusOrStatuses == 'ALL') {
            authorizedStatuses = Object.values(UserStatus);
        } else {
            authorizedStatuses = Array.isArray(userStatusOrStatuses)
                ? userStatusOrStatuses
                : [userStatusOrStatuses];
            if (!authorizedStatuses.length) {
                authorizedStatuses = [UserStatus.ACTIVE];
            }
        }
    } else {
        authorizedStatuses = [UserStatus.ACTIVE];
    }
    return applyDecorators(
        SetMetadata('roles', authorizedRoles),
        SetMetadata('statuses', authorizedStatuses),
        SetMetadata('authorization', true),
        ApiSecurity('authorization')
    );
};

export const LambdaAuthorized = () => {
    return SetMetadata('lambda-authorization', true);
};
