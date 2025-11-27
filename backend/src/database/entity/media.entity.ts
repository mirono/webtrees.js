import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity("media")
export class Media {
    @PrimaryColumn()
    id: string;

    @Column({ nullable: true })
    file?: string;

    @Column({ nullable: true })
    format?: string;

    @Column({ nullable: true })
    title?: string;

    @Column({ nullable: true })
    zip_bundle?: string;

    @Column({ nullable: true })
    zip_internal_path?: string;
}