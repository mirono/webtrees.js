import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ConfigService {
    private readonly configPath = path.resolve(process.cwd(), 'config.json');

    isConfigured(): boolean {
        return fs.existsSync(this.configPath);
    }

    saveConfig(data: any): void {
        fs.writeFileSync(this.configPath, JSON.stringify(data, null, 2));
    }
}
