import {
    Entity, PrimaryGeneratedColumn, ManyToOne,
    Column, Index
} from "typeorm";
import { GedcomEvent } from "./gedcom_event.entity";
import { Source } from "./source.entity";
import { Note } from "./note.entity";

@Entity("citations")
export class Citation {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => GedcomEvent, { nullable: true })
    @Index()
    event?: GedcomEvent;

    @ManyToOne(() => Source, { nullable: true })
    source?: Source;

    @ManyToOne(() => Note, { nullable: true })
    note?: Note;

    @Column({ nullable: true })
    page?: string;

    @Column({ nullable: true })
    citation_type?: string;

    @Column({ type: "text", nullable: true })
    data?: string; // structured JSON
}