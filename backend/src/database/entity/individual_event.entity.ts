import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Individual } from './individual.entity';

@Entity('individual_events')
export class IndividualEvent {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    individual_id: number;

    @Column()
    event_type: string; // BIRT, DEAT, etc.

    @Column({ nullable: true })
    date?: string;

    @Column({ nullable: true })
    place?: string;

    @ManyToOne(() => Individual, i => i.events)
    @JoinColumn({ name: 'individual_id' })
    individual: Individual;
}
