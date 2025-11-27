import {
    Entity, PrimaryGeneratedColumn, Column, ManyToOne, Index
} from "typeorm";
import { Media } from "./media.entity";

@Entity("media_links")
export class MediaLink {
    @PrimaryGeneratedColumn()
    id: number;

    @Index()
    @Column()
    record_type: string; // INDI, FAM, EVEN, NOTE, etc.

    @Index()
    @Column()
    record_id: string;

    @ManyToOne(() => Media)
    media: Media;
}