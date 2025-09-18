import { Controller, Get } from '@nestjs/common';

@Controller({})
export class RootController {
    constructor() {}

    @Get()
    getHello(): string {
        return 'Hello World!';
    }
}
