import { BaseEntity, RelatedAdventure, RelatedPlayerCharacter } from '../../shared/interfaces';

export interface NonPlayerCharacter extends BaseEntity {
    name: string;
    playerCharacter: RelatedPlayerCharacter;
    adventure: RelatedAdventure;
    adventureCount: number;
}
