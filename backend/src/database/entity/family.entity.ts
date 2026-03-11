import { Individual } from './individual.entity';
import { Entity, Column, PrimaryColumn, ManyToOne, ManyToMany, JoinTable } from 'typeorm';

@Entity('families')
export class Family {
    @PrimaryColumn()
    id: string;

    @ManyToOne(() => Individual, { nullable: true })
    husband?: Individual;

    @ManyToOne(() => Individual, { nullable: true })
    wife?: Individual;

    @ManyToMany(() => Individual)
    @JoinTable({
        name: 'family_children',
        joinColumn: { name: 'family_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'child_id', referencedColumnName: 'id' }
    })
    children?: Individual[];

}
