import { Controller, Get, Post, Body, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from './config.service';
import { DatabaseService } from '../database/database.service';
import { User } from '../database/entity/user.entity';

@Controller('config')
export class ConfigController {
    constructor(
        private readonly configService: ConfigService,
        private readonly databaseService: DatabaseService
    ) { }

    @Get('status')
    getStatus() {
        return { isConfigured: this.configService.isConfigured() };
    }

    @Post('setup')
    async setup(@Body() configData: any) {
        try {
            // 1. Initialize Database
            await this.databaseService.initializeDatabase(configData);

            // 2. Create Admin User
            const dataSource = this.databaseService.getDataSource();
            const userRepository = dataSource.getRepository(User);

            const adminUser = new User();
            adminUser.name = configData.admin.name;
            adminUser.username = configData.admin.username;
            adminUser.email = configData.admin.email;
            adminUser.password = configData.admin.password; // TODO: Hash password

            await userRepository.save(adminUser);

            // 3. Save Config
            this.configService.saveConfig(configData);

            return { success: true };
        } catch (error) {
            console.error('Setup failed:', error);
            throw new InternalServerErrorException('Setup failed: ' + error.message);
        }
    }
}
