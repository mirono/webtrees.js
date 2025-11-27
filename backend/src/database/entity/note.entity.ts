import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity("notes")
export class Note {
    @PrimaryColumn()
    id: string;

    @Column({ type: "text", nullable: true })
    text?: string;

    @Column({ default: "text" })
    format: string; // text | markdown
}