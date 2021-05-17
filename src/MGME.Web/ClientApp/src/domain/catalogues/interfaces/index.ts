import { BaseEntity } from '../../../shared/interfaces';

export interface PlayerCharacter extends BaseEntity {
    name: string;
    adventureCount: number;
    nonPlayerCharacterCount: number;
}
