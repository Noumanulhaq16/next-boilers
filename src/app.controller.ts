import { AppService } from './app.service';
import { ApiController } from 'core/decorators';

@ApiController({
    path: '/app',
    tag: 'app',
    version: '1'
})
export class AppController {
    constructor(private readonly appService: AppService) {}
}
