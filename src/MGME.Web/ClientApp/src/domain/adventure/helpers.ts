import { ReactElement } from 'react';

import { ChaosFactorEasyIcon, ChaosFactorMediumIcon, ChaosFactorHardIcon } from './components/icons';

export const chaosFactorOptions = Array.from(
    {length: 9},
    (_, i) => {
        return {
            value: i + 1,
            label: i + 1
        };
    }
);

export const determineChaosFactorIconComponent = (chaosFactor: number): ReactElement => {

    if (chaosFactor <= 3) {
        return ChaosFactorEasyIcon();
    }
    else if (chaosFactor <= 6) {
        return ChaosFactorMediumIcon();
    }

    return ChaosFactorHardIcon();
};

/*
A monkey-patch around mui tooltips: we either wrap svg component into span,
what messes icon background, or return component as a call
*/
export const returnCalledComponent = (component: () => ReactElement): ReactElement => component();
