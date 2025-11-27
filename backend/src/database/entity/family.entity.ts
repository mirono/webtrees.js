import { Individual } from './individual.entity';
import { Entity, Column, PrimaryColumn, ManyToOne } from 'typeorm';

@Entity('families')
export class Family {
    @PrimaryColumn()
    id: string;

    @ManyToOne(() => Individual, { nullable: true })
    husband?: Individual;

    @ManyToOne(() => Individual, { nullable: true })
    wife?: Individual;

}
