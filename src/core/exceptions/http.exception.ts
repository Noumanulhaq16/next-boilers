import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    BadRequestException,
    HttpStatus,
    InternalServerErrorException,
    Inject
} from '@nestjs/common';
import { Request, Response } from 'express';
// import { TranslatorService } from 'nestjs-translator';
import { Logger } from 'helpers/logger.helper';
import { ExceptionMessage } from '../../constants';
import { messages } from 'i18n/messages';

const LOCALE_HEADER_KEY = 'locale';

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
@Catch(HttpException, Error)
export class HttpExceptionFilter implements ExceptionFilter {
    // constructor(@Inject(TranslatorService) private _translatorService: TranslatorService) {}
    constructor() {}

    catch(exception: HttpException | Error, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response: any = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();
        const locale = request.headers[LOCALE_HEADER_KEY] as string;
        if (!(exception instanceof HttpException)) {
            Logger.Fatal(exception.stack ? exception.stack : exception, 'ERROR');
            let ResponseToSend = {
                // message: this._translatorService.translate(ExceptionMessage.common.errorsFatal, {
                //     lang: locale
                // })
                message: ExceptionMessage.common.errorsFatal
            };
            response.__ss_body = ResponseToSend;
            response.status(HttpStatus.INTERNAL_SERVER_ERROR).json(ResponseToSend);
            return;
        }
        const status = exception.getStatus();
        const exceptionResponse: any = exception.getResponse();
        if (
            exception instanceof BadRequestException &&
            exceptionResponse.message &&
            Array.isArray(exceptionResponse.message)
        ) {
            let ResponseToSend = {
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
            response.__ss_body = ResponseToSend;
            response.status(status).json(ResponseToSend);
        } else {
            let ResponseToSend = {
                // message: this._translatorService.translate(
                //     exceptionResponse.key || ExceptionMessage.common.errorsUnidentified,
                //     {
                //         lang: locale,
                //         replace: exceptionResponse.data
                //     }
                // ),
                message:
                    messages[exceptionResponse.key] || ExceptionMessage.common.errorsUnidentified,
                data: exceptionResponse?.data || undefined,
                error:
                    !exceptionResponse?.key && exceptionResponse.message
                        ? exceptionResponse.message
                        : undefined
            };
            response.__ss_body = ResponseToSend;
            response.status(status).json(ResponseToSend);
        }
    }
}
