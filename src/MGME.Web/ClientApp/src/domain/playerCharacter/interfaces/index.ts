import { BaseEntity } from '../../../shared/interfaces';

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

export interface AddPlayerCharacter {
    name: string;
    threads: { name: string; description: string; }[];
    newNonPlayerCharacters: { name: string; description: string }[];
    existingNonPlayerCharacters: number[];
}
