import { HttpException, HttpStatus } from '@nestjs/common';
import { ExceptionMessage } from '../../constants';
import { WsException } from '@nestjs/websockets';

export class NotFoundException extends HttpException {
    constructor(key: string = ExceptionMessage.common.errorsNotFound, data?: any) {
        super({ key, data }, HttpStatus.NOT_FOUND);
    }
}
export class UnAuthorizedException extends HttpException {
    constructor(key: string = ExceptionMessage.common.errorsUnauthorized, data?: any) {
        super({ key, data }, HttpStatus.UNAUTHORIZED);
    }
}
export class BadRequestException extends HttpException {
    constructor(key: string = ExceptionMessage.common.errorsBadRequest, data?: any) {
        super({ key, data }, HttpStatus.BAD_REQUEST);
    }
}
export class ForbiddenException extends HttpException {
    constructor(key: string = ExceptionMessage.common.errorsForbidden, data?: any) {
        super({ key, data }, HttpStatus.FORBIDDEN);
    }
}
export class FatalErrorException extends HttpException {
    constructor(key: string = ExceptionMessage.common.errorsFatal, data?: any) {
        super({ key, data }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}

export class NotFoundWsException extends WsException {
    constructor(key: string = ExceptionMessage.common.errorsNotFound, data?: any) {
        super({ key, data, status: HttpStatus.NOT_FOUND });
    }
}

export class UnAuthorizedWsException extends WsException {
    constructor(key: string = ExceptionMessage.common.errorsUnauthorized, data?: any) {
        super({ key, data, status: HttpStatus.UNAUTHORIZED });
    }
}
export class BadRequestWsException extends WsException {
    constructor(key: string = ExceptionMessage.common.errorsBadRequest, data?: any) {
        super({ key, data, status: HttpStatus.BAD_REQUEST });
    }
}
export class ForbiddenWsException extends WsException {
    constructor(key: string = ExceptionMessage.common.errorsForbidden, data?: any) {
        super({ key, data, status: HttpStatus.FORBIDDEN });
    }
}
export class FatalErrorWsException extends WsException {
    constructor(key: string = ExceptionMessage.common.errorsFatal, data?: any) {
        super({ key, data, status: HttpStatus.INTERNAL_SERVER_ERROR });
    }
}
