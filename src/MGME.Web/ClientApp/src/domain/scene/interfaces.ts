import { BaseEntity } from '../../shared/interfaces';

import { SceneType } from '../../shared/const/enums';

export interface Scene extends BaseEntity {
    title: string;
    type: SceneType;
    setup: string;
    modifiedSetup: string;
    randomEvent: string;
    resolved: boolean;
    createAt: string;
}
