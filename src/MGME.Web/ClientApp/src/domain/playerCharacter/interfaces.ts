import { BaseEntity } from '../../shared/interfaces';

import { RelatedNonPlayerCharacter } from '../nonPlayerCharacter/interfaces';

import { RelatedAdventure } from '../adventures/interfaces';

import { RelatedThread } from '../threads/interfaces';

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

export interface AvailablePlayerCharacter extends BaseEntity {
    name: string;
}
