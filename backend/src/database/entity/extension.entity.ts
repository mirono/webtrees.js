import {
    Entity, PrimaryGeneratedColumn, Column, Index
} from "typeorm";

@Entity("extensions")
export class Extension {
    @PrimaryGeneratedColumn()
    id: number;

    @Index()
    @Column()
    record_type: string;

    @Index()
    @Column()
    record_id: string;

    @Column({ nullable: true })
    namespace?: string;

    @Column({ nullable: true })
    tag?: string;

    @Column({ type: "text", nullable: true })
    value?: string;
}