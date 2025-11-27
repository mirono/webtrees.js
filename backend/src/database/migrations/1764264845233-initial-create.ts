import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialCreate1764264845233 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            username TEXT UNIQUE,
            email TEXT,
            password TEXT
        );`);

        await queryRunner.query(`CREATE TABLE individuals (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            gedcom_id TEXT UNIQUE,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            version INTEGER DEFAULT 0
        );`);

        await queryRunner.query(`CREATE TABLE individual_names (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            individual_id INTEGER NOT NULL,
            name_type TEXT,
            full TEXT NOT NULL,
            given TEXT,
            surname TEXT,
            prefix TEXT,
            suffix TEXT,
            FOREIGN KEY(individual_id) REFERENCES individuals(id) ON DELETE CASCADE
        );`);

        await queryRunner.query(`CREATE TABLE individual_events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            individual_id INTEGER NOT NULL,
            event_type TEXT NOT NULL,
            date TEXT,
            place TEXT,
            FOREIGN KEY(individual_id) REFERENCES individuals(id) ON DELETE CASCADE
        );`);

        await queryRunner.query(`CREATE TABLE individual_attributes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            individual_id INTEGER NOT NULL,
            attr_type TEXT NOT NULL,
            value TEXT,
            FOREIGN KEY(individual_id) REFERENCES individuals(id) ON DELETE CASCADE
        );`);

        await queryRunner.query(`CREATE TABLE families (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            gedcom_id TEXT UNIQUE,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            version INTEGER DEFAULT 0
        );`);

        await queryRunner.query(`CREATE TABLE family_links (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            family_id INTEGER NOT NULL,
            individual_id INTEGER NOT NULL,
            role TEXT NOT NULL,
            FOREIGN KEY(family_id) REFERENCES families(id) ON DELETE CASCADE,
            FOREIGN KEY(individual_id) REFERENCES individuals(id) ON DELETE CASCADE
        );`);

        await queryRunner.query(`CREATE TABLE family_events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            family_id INTEGER NOT NULL,
            event_type TEXT NOT NULL,
            date TEXT,
            place TEXT,
            FOREIGN KEY(family_id) REFERENCES families(id) ON DELETE CASCADE
        );`);

        await queryRunner.query(`CREATE TABLE sources (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            gedcom_id TEXT UNIQUE,
            title TEXT,
            authors TEXT,
            publication_info TEXT,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );`);

        await queryRunner.query(`CREATE TABLE source_citations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            source_id INTEGER NOT NULL,
            context_table TEXT NOT NULL,
            context_id INTEGER NOT NULL,
            page TEXT,
            data TEXT,
            FOREIGN KEY(source_id) REFERENCES sources(id) ON DELETE CASCADE
        );`);

        await queryRunner.query(`CREATE TABLE notes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            gedcom_id TEXT UNIQUE,
            text TEXT NOT NULL
        );`);

        await queryRunner.query(`CREATE TABLE note_links (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            note_id INTEGER NOT NULL,
            context_table TEXT NOT NULL,
            context_id INTEGER NOT NULL,
            FOREIGN KEY(note_id) REFERENCES notes(id) ON DELETE CASCADE
        );`);

        await queryRunner.query(`CREATE TABLE multimedia (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            gedcom_id TEXT UNIQUE,
            file TEXT,
            format TEXT,
            title TEXT
        );`);

        await queryRunner.query(`CREATE TABLE multimedia_links (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            media_id INTEGER NOT NULL,
            context_table TEXT NOT NULL,
            context_id INTEGER NOT NULL,
            FOREIGN KEY(media_id) REFERENCES multimedia(id) ON DELETE CASCADE
        );`);

        await queryRunner.query(`CREATE TABLE places (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            gedcom_id TEXT UNIQUE,
            name TEXT NOT NULL,
            latitude REAL,
            longitude REAL
        );`);

        await queryRunner.query(`CREATE TABLE place_hierarchy (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            parent_id INTEGER,
            child_id INTEGER NOT NULL,
            FOREIGN KEY(parent_id) REFERENCES places(id) ON DELETE SET NULL,
            FOREIGN KEY(child_id) REFERENCES places(id) ON DELETE CASCADE
        );`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE place_hierarchy`);
        await queryRunner.query(`DROP TABLE places`);
        await queryRunner.query(`DROP TABLE multimedia_links`);
        await queryRunner.query(`DROP TABLE multimedia`);
        await queryRunner.query(`DROP TABLE note_links`);
        await queryRunner.query(`DROP TABLE notes`);
        await queryRunner.query(`DROP TABLE source_citations`);
        await queryRunner.query(`DROP TABLE sources`);
        await queryRunner.query(`DROP TABLE family_events`);
        await queryRunner.query(`DROP TABLE family_links`);
        await queryRunner.query(`DROP TABLE families`);
        await queryRunner.query(`DROP TABLE individual_attributes`);
        await queryRunner.query(`DROP TABLE individual_events`);
        await queryRunner.query(`DROP TABLE individual_names`);
        await queryRunner.query(`DROP TABLE individuals`);
    }

}
