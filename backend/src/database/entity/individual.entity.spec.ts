import { Individual } from './individual.entity';
import { IndividualName } from './individual_name.entity';

describe('Individual Entity', () => {
    it('should create an individual with standard fields', () => {
        const individual = new Individual();
        individual.id = 1;
        individual.gedcom_id = 'I1';

        const name = new IndividualName();
        name.given = 'John';
        name.surname = 'Doe';
        name.full = 'John Doe';
        individual.names = [name];

        expect(individual.id).toBe(1);
        expect(individual.gedcom_id).toBe('I1');
        expect(individual.names).toHaveLength(1);
        expect(individual.names[0].given).toBe('John');
    });

    it('should allow optional events', () => {
        const individual = new Individual();
        individual.id = 1;
        
        expect(individual.events).toBeUndefined();
    });
});
