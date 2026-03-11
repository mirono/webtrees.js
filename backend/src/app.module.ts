import { Module, OnModuleInit } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { IndividualsModule } from './individuals/individuals.module';
import { DatabaseService } from './database/database.service';
import * as fs from 'fs';
import * as path from 'path';

@Module({
  imports: [ConfigModule, DatabaseModule, IndividualsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements OnModuleInit {
  constructor(private readonly databaseService: DatabaseService) { }

  async onModuleInit() {
    const configPath = path.resolve(process.cwd(), 'config.json');
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      await this.databaseService.initializeDatabase(config);
    }
  }
}
