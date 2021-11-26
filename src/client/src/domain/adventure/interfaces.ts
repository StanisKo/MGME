import { BaseEntity } from '../../shared/interfaces';

import { RelatedNonPlayerCharacter } from '../nonPlayerCharacter/interfaces';

import { RelatedPlayerCharacter } from '../playerCharacter/interfaces';

import { RelatedThread } from '../threads/interfaces';

export interface RelatedAdventure extends BaseEntity {
    title: string;
}

export interface Adventure extends BaseEntity {
    title: string;
    thread: RelatedThread;
    threadCount: number;
    chaosFactor: number;
    playerCharacter: RelatedPlayerCharacter;
    playerCharacterCount: number;
    nonPlayerCharacter: RelatedNonPlayerCharacter;
    nonPlayerCharacterCount: number;
    sceneCount: number;
    createdAt: string;
}

export interface AdventureDetail extends BaseEntity {
    title: string;
    context: string;
    chaosFactor: number;
    playerCharacters: RelatedPlayerCharacter[];
    nonPlayerCharacter: RelatedNonPlayerCharacter[];
    threads: RelatedThread[];
}

export interface IconProps {
    disabled: boolean;
}
