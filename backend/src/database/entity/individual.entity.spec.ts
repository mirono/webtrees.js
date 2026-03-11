import { Individual } from './individual.entity';

describe('Individual Entity', () => {
    it('should create an individual with standard fields', () => {
        const individual = new Individual();
        individual.id = 'I1';
        individual.given_name = 'John';
        individual.surname = 'Doe';
        individual.gender = 'M';

        expect(individual.id).toBe('I1');
        expect(individual.given_name).toBe('John');
        expect(individual.surname).toBe('Doe');
        expect(individual.gender).toBe('M');
    });

    it('should allow optional birth and death events', () => {
        const individual = new Individual();
        individual.id = 'I1';
        
        expect(individual.birth_event).toBeUndefined();
        expect(individual.death_event).toBeUndefined();
    });
});
