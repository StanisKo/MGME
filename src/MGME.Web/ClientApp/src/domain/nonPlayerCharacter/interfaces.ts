import { BaseEntity, RelatedAdventure } from '../../shared/interfaces';

import { RelatedPlayerCharacter } from '../playerCharacter/interfaces';

export interface AvailableNonPlayerCharacter extends BaseEntity {
    name: string;
}

export interface RelatedNonPlayerCharacter extends BaseEntity {
    name: string;
}

export interface NonPlayerCharacter extends BaseEntity {
    name: string;
    playerCharacter: RelatedPlayerCharacter;
    adventure: RelatedAdventure;
    adventureCount: number;
}
