import { ReactElement, useState, useEffect, MouseEvent, ChangeEvent } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { ApplicationState, UpdateStore } from '../../../store';

import { Adventure } from '../interfaces';

import { fetchAdventures } from '../requests';

import { HeadCell, Pagination } from '../../../shared/interfaces';
import { SortOrder, TABLE_DISPLAY_MODE } from '../../../shared/const';
import { isSelected, redirectToEntity } from '../../../shared/helpers';

import {
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    TableSortLabel,
    TablePagination,
    LinearProgress,
    Box,
    Radio,
    Checkbox,
    Typography
} from '@material-ui/core';

import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

import moment from 'moment';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            width: '100%'
        },
        visuallyHidden: {
            border: 0,
            clip: 'rect(0 0 0 0)',
            height: 1,
            margin: -1,
            overflow: 'hidden',
            padding: 0,
            position: 'absolute',
            top: 20,
            width: 1
        },
        noEntities: {
            fontSize: '18px',
            color: '#808080'
        }
    })
);

interface AdventureTableProps {
    mode: TABLE_DISPLAY_MODE
}

const headCells: HeadCell[] = [
    { label: 'Title', sorting: 'title', numeric: false },
    { label: 'Thread', sorting: 'thread', numeric: true },
    { label: 'Chaos Factor', sorting: 'chaos', numeric: true },
    { label: 'Created', sorting: 'created', numeric: true },
    { label: 'Character', sorting: 'character', numeric: true },
    { label: 'NPC', sorting: 'npc', numeric: true },
    { label: 'Scenes', sorting: 'scene', numeric: true }
];

export const AdventuresTable = ({ mode }: AdventureTableProps): ReactElement => {
    const dispatch = useDispatch();

    const isAuthorized: boolean = useSelector(
        (store: ApplicationState) => Boolean(store.auth?.token) ?? false
    );

    const adventuresToShow: Adventure[] | null = useSelector(
        (state: ApplicationState) => state.adventures?.dataset?.data ?? null
    );

    const adventuresToAddTo: Adventure[] | null = useSelector(
        (state: ApplicationState) => state.catalogues?.adventures?.data ?? null
    );

    const paginationOfToShow: Pagination | null = useSelector(
        (state: ApplicationState) => state.adventures?.dataset?.pagination ?? null
    );

    const paginationOfToAddTo: Pagination | null = useSelector(
        (state: ApplicationState) => state.catalogues?.adventures?.pagination ?? null
    );

    const selectedPlayerCharacters = useSelector(
        (store: ApplicationState) => store.catalogues?.playerCharacters?.selected ?? []
    );

    const selectedNonPlayerCharacters = useSelector(
        (store: ApplicationState) => store.catalogues?.nonPlayerCharacters?.selected ?? []
    );

    const [page, setPage] = useState(0);
    const [order, setOrder] = useState<SortOrder>('asc');
    const [orderBy, setOrderBy] = useState<string>('title');

    const [singleSelected, setSingleSelected] = useState<number>(0);
    const [multipleSelected, setMultipleSelected] = useState<number[]>([]);

    const handleSelectAll = (event: ChangeEvent<HTMLInputElement>): void => {
        let newSelected: number[] = [];

        if (event.target.checked) {
            newSelected = (adventuresToShow ?? []).map((adventure: Adventure) => adventure.id);
        }
        else {
            newSelected = [];
        }

        setMultipleSelected(newSelected);

        dispatch<UpdateStore<{ selected: number[] }>>(
            {
                type: 'UPDATE_STORE',
                reducer: 'adventures',
                key: 'dataset',
                payload: {
                    selected: newSelected
                }
            }
        );
    };

    const handleSelect = (selectedId: number) => (event: MouseEvent<unknown>): void => {
        if (mode === TABLE_DISPLAY_MODE.TO_SHOW) {
            let newSelected: number[] = [];

            if (multipleSelected.includes(selectedId)) {
                newSelected = multipleSelected.filter((id: number) => id !== selectedId);
            }
            else {
                newSelected = [...multipleSelected, selectedId];
            }

            setMultipleSelected(newSelected);

            dispatch<UpdateStore<{ selected: number[] }>>(
                {
                    type: 'UPDATE_STORE',
                    reducer: 'adventures',
                    key: 'dataset',
                    payload: {
                        selected: newSelected
                    }
                }
            );
        }
        else
        {
            setSingleSelected(selectedId);

            dispatch<UpdateStore<{ selected: number }>>(
                {
                    type: 'UPDATE_STORE',
                    reducer: 'catalogues',
                    key: 'adventures',
                    payload: {
                        selected: selectedId
                    }
                }
            );
        }
    };

    const handleSorting = (newSortingParam: string) => (event: MouseEvent<unknown>): void => {
        const wasAscending = orderBy === newSortingParam && order === 'asc';

        setOrder(wasAscending ? 'desc' : 'asc');

        setOrderBy(newSortingParam);
    };

    const handlePageChange = (event: unknown, newPage: number): void => {
        setPage(newPage);
    };

    // Initial request
    useEffect(() => {
        (async (): Promise<void> => {
            if (isAuthorized) {

                if (mode === TABLE_DISPLAY_MODE.TO_SHOW && adventuresToShow === null) {
                    await fetchAdventures('adventures', 'dataset');
                }
                else if (mode === TABLE_DISPLAY_MODE.TO_ADD_TO && adventuresToAddTo === null) {
                    await fetchAdventures('catalogues', 'adventures');
                }

            }
        })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthorized, adventuresToShow, adventuresToAddTo]);

    // Request with params
    useEffect(() => {
        (async (): Promise<void> => {
            if (isAuthorized) {

                if (mode === TABLE_DISPLAY_MODE.TO_SHOW) {
                    await fetchAdventures(
                        'adventures',
                        'dataset',
                        page + 1,
                        `${order === 'asc' ? '' : '-'}${orderBy}`
                    );

                    return;
                }

                await fetchAdventures(
                    'catalogues',
                    'adventures',
                    page + 1,
                    `${order === 'asc' ? '' : '-'}${orderBy}`
                );
            }
        })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, order, orderBy]);

    // Default current state every time new dataset comes in, keep it simple
    useEffect(() => {
        if (adventuresToShow || adventuresToAddTo) {

            if (multipleSelected.length > 0) {
                setMultipleSelected([]);

                dispatch<UpdateStore<{ selected: number[] }>>(
                    {
                        type: 'UPDATE_STORE',
                        reducer: 'adventures',
                        key: 'dataset',
                        payload: {
                            selected: []
                        }
                    }
                );
            }
            else if (singleSelected > 0) {
                setSingleSelected(0);

                dispatch<UpdateStore<{ selected: number }>>(
                    {
                        type: 'UPDATE_STORE',
                        reducer: 'catalogues',
                        key: 'adventures',
                        payload: {
                            selected: 0
                        }
                    }
                );
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [adventuresToShow, adventuresToAddTo]);

    useEffect(() => {
        return (): void => {
            setMultipleSelected([]);

            dispatch<UpdateStore<{ selected: number[] }>>(
                {
                    type: 'UPDATE_STORE',
                    reducer: 'adventures',
                    key: 'dataset',
                    payload: {
                        selected: []
                    }
                }
            );

            setSingleSelected(0);

            dispatch<UpdateStore<{ selected: number }>>(
                {
                    type: 'UPDATE_STORE',
                    reducer: 'catalogues',
                    key: 'adventures',
                    payload: {
                        selected: 0
                    }
                }
            );
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const shouldFlushSelectedAdventure = mode === TABLE_DISPLAY_MODE.TO_ADD_TO
            && selectedNonPlayerCharacters.length === 0
                && (selectedPlayerCharacters as number[]).length === 0;

        if (shouldFlushSelectedAdventure) {
            dispatch<UpdateStore<{ selected: number }>>(
                {
                    type: 'UPDATE_STORE',
                    reducer: 'catalogues',
                    key: 'adventures',
                    payload: {
                        selected: 0
                    }
                }
            );
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedPlayerCharacters, selectedNonPlayerCharacters]);

    const { root, visuallyHidden, noEntities } = useStyles();

    return (
        mode === TABLE_DISPLAY_MODE.TO_SHOW
            ? adventuresToShow !== null && paginationOfToShow !== null
            : adventuresToAddTo !== null && paginationOfToAddTo !== null
    ) ? (
            <Box mt={2}>
                <Table className={root}>
                    <TableHead>
                        <TableRow>
                            <TableCell padding="checkbox">
                                {mode === TABLE_DISPLAY_MODE.TO_SHOW && (
                                    <Checkbox
                                        checked={
                                            multipleSelected.length
                                                ? multipleSelected.length === adventuresToShow?.length
                                                : false
                                        }
                                        /*
                                        Forced casting as TS doesn't understand adventuresToShow?.length
                                        with arithmetical operators
                                        */
                                        indeterminate={
                                            multipleSelected.length
                                                ? multipleSelected.length > 0
                                                    && multipleSelected.length
                                                        < (adventuresToShow as Adventure[]).length
                                                : false
                                        }
                                        onChange={handleSelectAll}
                                    />
                                )}
                            </TableCell>
                            {headCells.map((headCell) => (
                                <TableCell
                                    key={headCell.label}
                                    align={headCell.numeric ? 'right' : 'left'}
                                    sortDirection={orderBy === headCell.sorting ? order : false}
                                >
                                    <TableSortLabel
                                        active={orderBy === headCell.sorting}
                                        direction={orderBy === headCell.sorting ? order : 'asc'}
                                        onClick={handleSorting(headCell.sorting)}
                                        style={{ fontWeight: 'bold' }}
                                    >
                                        {headCell.label}
                                        {orderBy === headCell.sorting ? (
                                            <span className={visuallyHidden}>
                                                {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                                            </span>
                                        ) : null}
                                    </TableSortLabel>
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {(mode === TABLE_DISPLAY_MODE.TO_SHOW
                            ? adventuresToShow
                            : adventuresToAddTo
                        )?.map((adventure, index) => {

                            const isItemSelected = mode === TABLE_DISPLAY_MODE.TO_SHOW
                                ? isSelected(adventure.id, multipleSelected)
                                : singleSelected === adventure.id;

                            const labelId = `adventure-table-checkbox-${index}`;

                            return (
                                <TableRow
                                    hover
                                    aria-checked={isItemSelected}
                                    tabIndex={-1}
                                    key={adventure.title}
                                    selected={isItemSelected}
                                    onClick={redirectToEntity('adventure', adventure.id)}
                                >
                                    <TableCell padding="checkbox">
                                        {mode === TABLE_DISPLAY_MODE.TO_SHOW ? (
                                            <Checkbox
                                                checked={isItemSelected}
                                                inputProps={{ 'aria-labelledby': labelId }}
                                                onClick={handleSelect(adventure.id)}
                                            />
                                        ) : (
                                            <Radio
                                                checked={isItemSelected}
                                                inputProps={{ 'aria-labelledby': labelId }}
                                                onClick={handleSelect(adventure.id)}
                                            />
                                        )}
                                    </TableCell>

                                    <TableCell align="left">
                                        {adventure.title}
                                    </TableCell>

                                    <TableCell align="right">
                                        {adventure.thread?.name
                                            ?? `${adventure.threadCount} threads`}
                                    </TableCell>

                                    <TableCell align="right">
                                        {adventure.chaosFactor}
                                    </TableCell>

                                    <TableCell align="right">
                                        {moment(adventure.createdAt).fromNow()}
                                    </TableCell>

                                    <TableCell align="right">
                                        {adventure.playerCharacter?.name
                                            ?? `${adventure.playerCharacterCount} Characters`}
                                    </TableCell>

                                    <TableCell align="right">
                                        {adventure.nonPlayerCharacter?.name
                                            ?? `${adventure.nonPlayerCharacterCount} NPCs`}
                                    </TableCell>

                                    <TableCell align="right">
                                        {
                                            adventure.sceneCount === 0
                                                ? 'No Scenes Yet'
                                                : `${adventure.sceneCount} Scene${adventure.sceneCount > 1 ? 's' : ''}`
                                        }
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
                {(adventuresToShow?.length === 0 || adventuresToAddTo?.length === 0) && (
                    <Box mt={4} mb={2}>
                        <Typography align="center" className={noEntities}>
                            There are no adventures yet, go ahead and add some!
                        </Typography>
                    </Box>
                )}
                {(adventuresToAddTo?.length || adventuresToShow?.length) ? (
                    <Box mt={2}>
                        <TablePagination
                            component="div"
                            rowsPerPage={15}
                            rowsPerPageOptions={[]}
                            count={
                                (mode === TABLE_DISPLAY_MODE.TO_SHOW
                                    ? paginationOfToShow?.numberOfResults
                                    : paginationOfToAddTo?.numberOfResults
                                ) as number
                            }
                            page={page}
                            onPageChange={handlePageChange}
                        />
                    </Box>
                ) : null}
            </Box>
        ) : <LinearProgress />;
};
