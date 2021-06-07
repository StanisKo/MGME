import { ReactElement } from 'react';

import MuiAlert, { AlertProps } from '@material-ui/lab/Alert';

export const Alert = (props: AlertProps): ReactElement => <MuiAlert elevation={6} variant="filled" {...props} />;
