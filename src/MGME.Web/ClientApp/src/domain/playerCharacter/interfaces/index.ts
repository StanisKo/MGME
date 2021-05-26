import { BaseEntity } from '../../../shared/interfaces';

interface Adventure extends BaseEntity {
    title: string;
}

interface NonPlayerCharacter extends BaseEntity {
    name: string;
}

export interface PlayerCharacter extends BaseEntity {
    name: string;
    adventure: Adventure;
    adventureCount: number;
    nonPlayerCharacter: NonPlayerCharacter;
    nonPlayerCharacterCount: number;
}
