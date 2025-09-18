import { ArgumentsHost, Catch, HttpStatus, Inject } from '@nestjs/common';
import { Socket } from 'socket.io';
import { Logger } from 'helpers/logger.helper';
// import { TranslatorService } from 'nestjs-translator';
import { WsException } from '@nestjs/websockets';
import { ExceptionMessage } from '../../constants';
import ErrorSocketEvent from 'modules/socket/events/error.event';
import { messages } from 'i18n/messages';

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

@Catch(WsException, Error)
export class SocketExceptionFilter {
    // constructor(@Inject(TranslatorService) private _translatorService: TranslatorService) {}
    constructor() {}

    catch(exception: WsException | Error, host: ArgumentsHost) {
        const ctx = host.switchToWs();
        const socket = ctx.getClient<Socket>();
        const locale = 'en';

        if (!(exception instanceof WsException)) {
            Logger.Fatal(exception.stack ? exception.stack : exception, 'SOCKET-ERROR');
            let ResponseToSend = {
                // message: this._translatorService.translate(ExceptionMessage.common.errorsFatal, {
                //     lang: locale
                // }),
                message: ExceptionMessage.common.errorsFatal,
                status: HttpStatus.INTERNAL_SERVER_ERROR
            };

            const event = new ErrorSocketEvent(socket, ResponseToSend);
            event.SendToSelf();
            return;
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
                //             values: exceptionResponse.message.map((x) => x.property).join(', ')
                //         },
                //         lang: locale
                //     }
                // ),
                message: ExceptionMessage.common.errorsInvalidValues,
                errors: _prepareBadRequestValidationErrors(exceptionResponse.message)
            };

            const event = new ErrorSocketEvent(socket, ResponseToSend);
            event.SendToSelf();
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
                    messages[exceptionResponse.key] || ExceptionMessage.common.errorsUnidentified,
                data: exceptionResponse?.data || undefined
            };

            const event = new ErrorSocketEvent(socket, ResponseToSend);
            event.SendToSelf();
        }
    }
}
