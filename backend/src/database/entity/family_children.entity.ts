import { Entity, PrimaryColumn, ManyToOne } from 'typeorm';
import { Family } from './family.entity';
import { Individual } from './individual.entity';

@Entity('family_children')
export class FamilyChildren {

    @PrimaryColumn()
    family_id: string;

    @PrimaryColumn()
    child_id: string;

    @ManyToOne(() => Family, f => f.id)
    family: Family;

    @ManyToOne(() => Individual, i => i.id)
    child: Individual;


}
