import { BaseEntity, RelatedThread, RelatedAdventure, RelatedNonPlayerCharacter } from '../../shared/interfaces';

export interface PlayerCharacter extends BaseEntity {
    name: string;
    thread: RelatedThread;
    threadCount: number;
    adventure: RelatedAdventure;
    adventureCount: number;
    nonPlayerCharacter: RelatedNonPlayerCharacter;
    nonPlayerCharacterCount: number;
}
