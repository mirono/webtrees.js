import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as path from 'path';

export interface DatabaseConfig {
    databaseType: 'sqlite' | 'mysql' | 'postgresql' | 'sqlserver';
    databaseConfig: {
        connectionType?: string;
        serverName?: string;
        port?: string;
        username?: string;
        password?: string;
        databaseName?: string;
        tablePrefix: string;
    };
}

@Injectable()
export class DatabaseService {
    private dataSource: DataSource;
    private readonly logger = new Logger(DatabaseService.name);

    async initializeDatabase(config: DatabaseConfig): Promise<void> {
        if (this.dataSource && this.dataSource.isInitialized) {
            await this.dataSource.destroy();
        }

        if (config.databaseType === 'sqlite') {
            const dbPath = path.resolve(process.cwd(), 'data', 'webtrees.sqlite');

            // Ensure data directory exists
            const fs = require('fs');
            const dataDir = path.dirname(dbPath);
            if (!fs.existsSync(dataDir)) {
                fs.mkdirSync(dataDir, { recursive: true });
            }

            this.dataSource = new DataSource({
                type: 'sqlite',
                database: dbPath,
                entities: [__dirname + "/entity/*{.js,.ts}"],
                synchronize: false, // DO NOT Auto-create schema, risky for production data
                logging: true,
                migrations: [__dirname + "/migrations/*.{js,.ts}"],
                migrationsRun: true,
                migrationsTableName: 'migrations',
                migrationsTransactionMode: 'all'
            });

            try {
                await this.dataSource.initialize();
                this.logger.log('Database initialized successfully');
            } catch (error) {
                this.logger.error('Error initializing database', error);
                throw error;
            }
        } else {
            throw new Error(`Database type ${config.databaseType} not yet supported for initialization`);
        }
    }

    getDataSource(): DataSource {
        return this.dataSource;
    }
}
