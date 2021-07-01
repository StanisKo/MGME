import { BaseEntity, RelatedThread } from '../../shared/interfaces';

import { RelatedNonPlayerCharacter } from '../nonPlayerCharacter/interfaces';

import { RelatedAdventure } from '../adventures/interfaces';

export interface RelatedPlayerCharacter extends BaseEntity {
    name: string;
}

export interface PlayerCharacter extends BaseEntity {
    name: string;
    thread: RelatedThread;
    threadCount: number;
    adventure: RelatedAdventure;
    adventureCount: number;
    nonPlayerCharacter: RelatedNonPlayerCharacter;
    nonPlayerCharacterCount: number;
}
