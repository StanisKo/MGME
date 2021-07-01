import { BaseEntity, RelatedAdventure, RelatedPlayerCharacter } from '../../shared/interfaces';

export interface NonPlayerCharacter extends BaseEntity {
    name: string;
    playerCharacter: RelatedPlayerCharacter;
    adventure: RelatedAdventure;
    adventureCount: number;
}

export interface AvailableNonPlayerCharacter extends BaseEntity {
    name: string;
}
