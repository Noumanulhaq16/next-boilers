import { createParamDecorator } from '@nestjs/common';
import { App } from '../../app';
import { UnAuthorizedException } from 'core/exceptions/response.exception';
import DeviceService from 'modules/app/device/device.service';

export const CurrentDevice = createParamDecorator(async (data, context) => {
    const request = context.switchToHttp().getRequest();
    const token = request.headers['authorization'];
    if (!token) {
        throw new UnAuthorizedException();
    }
    const app = await App.GetNestApplicationInstance();
    const _deviceService = app.get(DeviceService);
    const device = await _deviceService.FindByAuthToken(token);
    return device ? device : null;
});
