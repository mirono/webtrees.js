import { Family } from './family.entity';
import { Individual } from './individual.entity';

describe('Family Entity', () => {
    it('should create a family with husband and wife', () => {
        const family = new Family();
        family.id = 'F1';
        
        const husband = new Individual();
        husband.id = 'I1';
        husband.given_name = 'John';
        husband.surname = 'Doe';
        husband.gender = 'M';

        const wife = new Individual();
        wife.id = 'I2';
        wife.given_name = 'Jane';
        wife.surname = 'Doe';
        wife.gender = 'F';

        family.husband = husband;
        family.wife = wife;

        expect(family.id).toBe('F1');
        expect(family.husband.id).toBe('I1');
        expect(family.wife.id).toBe('I2');
    });

    it('should allow adding children to a family', () => {
        const family = new Family();
        family.id = 'F1';

        const child = new Individual();
        child.id = 'I3';
        child.given_name = 'Junior';
        child.surname = 'Doe';

        family.children = [child];

        expect(family.children).toHaveLength(1);
        expect(family.children[0].id).toBe('I3');
    });
});
