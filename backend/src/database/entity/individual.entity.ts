import { GedcomEvent } from './gedcom_event.entity';
import { Entity, Column, Index, PrimaryColumn, ManyToOne } from 'typeorm';

@Entity('individuals')
export class Individual {
    @PrimaryColumn()
    id: string; // GEDCOM XREF

    @Index()
    @Column({ nullable: true })
    given_name?: string;

    @Index()
    @Column({ nullable: true })
    surname?: string;

    @Column({ nullable: true })
    gender?: string; // M / F / U

    @ManyToOne(() => GedcomEvent, { nullable: true })
    birth_event?: GedcomEvent;

    @ManyToOne(() => GedcomEvent, { nullable: true })
    death_event?: GedcomEvent;

}
