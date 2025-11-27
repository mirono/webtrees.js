import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity("sources")
export class Source {
    @PrimaryColumn()
    id: string;

    @Column({ nullable: true })
    title?: string;

    @Column({ nullable: true })
    author?: string;

    @Column({ type: "text", nullable: true })
    publication_data?: string;

    @Column({ type: "text", nullable: true })
    text?: string;
}