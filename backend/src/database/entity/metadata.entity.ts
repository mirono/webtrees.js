import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity("metadata")
export class Metadata {
    @PrimaryColumn()
    key: string;

    @Column({ type: "text", nullable: true })
    value?: string;
}