import { IndividualName } from './individual_name.entity';
import { IndividualEvent } from './individual_event.entity';
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

@Entity('individuals')
export class Individual {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    gedcom_id: string; // GEDCOM XREF

    @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
    updated_at: Date;

    @Column({ default: 0 })
    version: number;

    @OneToMany(() => IndividualName, n => n.individual)
    names?: IndividualName[];

    @OneToMany(() => IndividualEvent, e => e.individual)
    events?: IndividualEvent[];
}
