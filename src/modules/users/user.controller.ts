import { Controller, Get } from '@nestjs/common';

@Controller('hello')
export class HelloWorldController {
    @Get()
    getHello(): string {
        return 'Hello World!';
    }
}