import { BaseEntity } from '../../shared/interfaces';

import { RelatedPlayerCharacter } from '../playerCharacter/interfaces';

import { RelatedAdventure } from '../adventure/interfaces';

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
