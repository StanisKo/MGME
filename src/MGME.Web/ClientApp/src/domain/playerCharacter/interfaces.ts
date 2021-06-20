import { BaseEntity } from '../../shared/interfaces';

interface Thread extends BaseEntity {
    name: string;
}

interface Adventure extends BaseEntity {
    title: string;
}

interface NonPlayerCharacter extends BaseEntity {
    name: string;
}

export interface PlayerCharacter extends BaseEntity {
    name: string;
    thread: Thread;
    threadCount: number;
    adventure: Adventure;
    adventureCount: number;
    nonPlayerCharacter: NonPlayerCharacter;
    nonPlayerCharacterCount: number;
}
