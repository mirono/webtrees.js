import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Individual } from './individual.entity';

@Entity('individual_names')
export class IndividualName {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    individual_id: number;

    @Column({ nullable: true })
    name_type?: string;

    @Column()
    full: string;

    @Column({ nullable: true })
    given?: string;

    @Column({ nullable: true })
    surname?: string;

    @Column({ nullable: true })
    prefix?: string;

    @Column({ nullable: true })
    suffix?: string;

    @ManyToOne(() => Individual, i => i.names)
    @JoinColumn({ name: 'individual_id' })
    individual: Individual;
}
