import { BaseEntity, RelatedThread, RelatedAdventure } from '../../shared/interfaces';

import { RelatedNonPlayerCharacter } from '../nonPlayerCharacter/interfaces';

export interface PlayerCharacter extends BaseEntity {
    name: string;
    thread: RelatedThread;
    threadCount: number;
    adventure: RelatedAdventure;
    adventureCount: number;
    nonPlayerCharacter: RelatedNonPlayerCharacter;
    nonPlayerCharacterCount: number;
}

export interface RelatedPlayerCharacter extends BaseEntity {
    name: string;
}
