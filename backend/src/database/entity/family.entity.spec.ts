import { Family } from './family.entity';
import { FamilyLink } from './family_link.entity';
import { Individual } from './individual.entity';

describe('Family Entity', () => {
    it('should create a family with links', () => {
        const family = new Family();
        family.id = 1;
        family.gedcom_id = 'F1';
        
        const husbandLink = new FamilyLink();
        husbandLink.role = 'HUSB';
        husbandLink.individual = new Individual();
        husbandLink.individual.id = 1;
        husbandLink.individual.gedcom_id = 'I1';

        const wifeLink = new FamilyLink();
        wifeLink.role = 'WIFE';
        wifeLink.individual = new Individual();
        wifeLink.individual.id = 2;
        wifeLink.individual.gedcom_id = 'I2';

        family.links = [husbandLink, wifeLink];

        expect(family.id).toBe(1);
        expect(family.gedcom_id).toBe('F1');
        expect(family.links).toHaveLength(2);
        expect(family.links.find(l => l.role === 'HUSB')?.individual?.gedcom_id).toBe('I1');
    });
});
