import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Family } from './family.entity';
import { Individual } from './individual.entity';

@Entity('family_links')
export class FamilyLink {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    family_id: number;

    @Column()
    individual_id: number;

    @Column()
    role: string; // HUSB, WIFE, CHIL

    @ManyToOne(() => Family, f => f.links)
    @JoinColumn({ name: 'family_id' })
    family: Family;

    @ManyToOne(() => Individual)
    @JoinColumn({ name: 'individual_id' })
    individual: Individual;
}
