import { Family } from './family.entity';
import { Individual } from './individual.entity';
import { Entity, Column, PrimaryGeneratedColumn, Index, ManyToOne } from 'typeorm';

export type RecordType = "INDI" | "FAM";

@Entity('events')
export class GedcomEvent {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    record_type: RecordType;

    @Column()
    record_id: string;

    @Index()
    @Column()
    event_type: string; // BIRT, DEAT, MARR, etc.

    @Column({ nullable: true })
    date?: string;

    @Column({ nullable: true })
    place?: string;

    @Column({ type: "text", nullable: true })
    description?: string;

    @Column({ default: false })
    negated: boolean;

    // Not enforced by schema: choose dynamically based on record_type
    @ManyToOne(() => Individual, { nullable: true })
    individual?: Individual;

    @ManyToOne(() => Family, { nullable: true })
    family?: Family;

}