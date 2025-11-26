import { Controller, Get, Post, Body } from '@nestjs/common';
import { ConfigService } from './config.service';

@Controller('config')
export class ConfigController {
    constructor(private readonly configService: ConfigService) { }

    @Get('status')
    getStatus() {
        return { isConfigured: this.configService.isConfigured() };
    }

    @Post('setup')
    setup(@Body() configData: any) {
        this.configService.saveConfig(configData);
        return { success: true };
    }
}
