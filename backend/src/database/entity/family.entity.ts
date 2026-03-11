import { FamilyLink } from './family_link.entity';
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

@Entity('families')
export class Family {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    gedcom_id: string; // GEDCOM XREF

    @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
    updated_at: Date;

    @Column({ default: 0 })
    version: number;

    @OneToMany(() => FamilyLink, l => l.family)
    links?: FamilyLink[];
}
