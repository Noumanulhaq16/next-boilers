import {
    CallHandler,
    ExecutionContext,
    HttpStatus,
    Inject,
    Injectable,
    NestInterceptor
} from '@nestjs/common';
// import { TranslatorService } from 'nestjs-translator';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Socket } from 'socket.io';
import { WsException } from '@nestjs/websockets';
import { Logger } from 'helpers/logger.helper';
import { ExceptionMessage } from '../../constants';
import ErrorSocketEvent from 'modules/socket/events/error.event';

function _prepareBadRequestValidationErrors(errors) {
    let Errors: any = {};
    for (const err of errors) {
        const constraint =
            err.constraints &&
            Object.values(err.constraints) &&
            Object.values(err.constraints).length &&
            Object.values(err.constraints)[0];
        Errors[err.property] = constraint ? constraint : `${err.property} is invalid`;
    }
    return Errors;
}

@Injectable()
export class SocketErrorInterceptor<T> implements NestInterceptor<T, any> {
    // constructor(@Inject(TranslatorService) private _translatorService: TranslatorService) {}
    constructor() {}

    intercept(
        context: ExecutionContext,
        next: CallHandler<T>
    ): Observable<any> | Promise<Observable<any>> {
        const ctx = context.switchToWs();
        const socket = ctx.getClient<Socket>();
        const locale = 'en';

        return next.handle().pipe(
            map((exception: any) => {
                if (!(exception instanceof Error)) {
                    return exception;
                }
                if (!(exception instanceof WsException)) {
                    Logger.Fatal(exception.stack ? exception.stack : exception, 'SOCKET-ERROR');
                    let ResponseToSend = {
                        // message: this._translatorService.translate(
                        //     ExceptionMessage.common.errorsFatal,
                        //     {
                        //         lang: locale
                        //     }
                        // ),
                        message: ExceptionMessage.common.errorsFatal,
                        status: HttpStatus.INTERNAL_SERVER_ERROR
                    };

                    const event = new ErrorSocketEvent(socket, ResponseToSend);
                    return event.GetData();
                }
                const exceptionResponse: any = exception.getError();
                const status = exceptionResponse?.status;
                if (
                    exception instanceof WsException &&
                    exceptionResponse.message &&
                    Array.isArray(exceptionResponse.message)
                ) {
                    let ResponseToSend = {
                        status,
                        // message: this._translatorService.translate(
                        //     ExceptionMessage.common.errorsInvalidValues,
                        //     {
                        //         replace: {
                        //             values: exceptionResponse.message
                        //                 .map((x) => x.property)
                        //                 .join(', ')
                        //         },
                        //         lang: locale
                        //     }
                        // ),
                        message: ExceptionMessage.common.errorsInvalidValues,
                        errors: _prepareBadRequestValidationErrors(exceptionResponse.message)
                    };

                    const event = new ErrorSocketEvent(socket, ResponseToSend);
                    return event.GetData();
                } else {
                    let ResponseToSend = {
                        status,
                        // message: this._translatorService.translate(
                        //     exceptionResponse.key || ExceptionMessage.common.errorsUnidentified,
                        //     {
                        //         lang: locale,
                        //         replace: exceptionResponse.data
                        //     }
                        // ),
                        message:
                            exceptionResponse.key || ExceptionMessage.common.errorsUnidentified,
                        data: exceptionResponse?.data || undefined
                    };

                    const event = new ErrorSocketEvent(socket, ResponseToSend);
                    return event.GetData();
                }
            })
        );
    }
}
