import { ReactElement, useState, useEffect, ChangeEvent, MouseEvent } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { ApplicationState, UpdateStore } from '../../../store';

import { PlayerCharacter } from '../interfaces';
import { fetchPlayerCharacters } from '../requests';

import { HeadCell, Pagination } from '../../../shared/interfaces';
import { SortOrder, PLAYER_CHARACTER_TABLE_DISPLAY_MODE } from '../../../shared/const';
import { isSelected } from '../../../shared/helpers';

import {
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    Checkbox,
    TableSortLabel,
    TablePagination,
    LinearProgress,
    Box,
    Radio
} from '@material-ui/core';

import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

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
        }
    })
);

interface PlayerCharacterTableProps {
    mode: PLAYER_CHARACTER_TABLE_DISPLAY_MODE
}

const headCells: HeadCell[] = [
    { label: 'Name', sorting: 'name', numeric: false },
    { label: 'Thread', sorting: 'thread', numeric: true },
    { label: 'Adventure', sorting: 'adventure', numeric: true },
    { label: 'NPC', sorting: 'npc', numeric: true }
];

export const PlayerCharactersTable = ({ mode }: PlayerCharacterTableProps): ReactElement => {
    const dispatch = useDispatch();

    const isAuthorized: boolean = useSelector(
        (store: ApplicationState) => Boolean(store.auth?.token) ?? false
    );

    const playerCharacters: PlayerCharacter[] | null = useSelector(
        (state: ApplicationState) => state.catalogues?.playerCharacters?.data ?? null
    );

    const pagination: Pagination | null = useSelector(
        (state: ApplicationState) => state.catalogues?.playerCharacters?.pagination ?? null
    );

    const [page, setPage] = useState(0);
    const [order, setOrder] = useState<SortOrder>('asc');
    const [orderBy, setOrderBy] = useState<string>('name');

    const [singleSelected, setSingleSelected] = useState<number>(0);
    const [multipleSelected, setMultipleSelected] = useState<number[]>([]);

    /*
    We dispatch values to store in separate handlers and not on hook, to avoid unnecessary
    rerendered in subscribed components
    */

    const handleSelectAll = (event: ChangeEvent<HTMLInputElement>): void => {
        let newSelected: number[] = [];

        if (event.target.checked) {
            newSelected = (playerCharacters ?? []).map((playerCharacter: PlayerCharacter) => playerCharacter.id);
        }
        else {
            newSelected = [];
        }

        setMultipleSelected(newSelected);

        dispatch<UpdateStore<{ selected: number[] }>>(
            {
                type: 'UPDATE_STORE',
                reducer: 'catalogues',
                key: 'playerCharacters',
                payload: {
                    selected: newSelected
                }
            }
        );
    };

    const handleSelect = (selectedId: number) => (event: MouseEvent<unknown>): void => {
        if (mode === PLAYER_CHARACTER_TABLE_DISPLAY_MODE.TO_SHOW) {
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
                    reducer: 'catalogues',
                    key: 'playerCharacters',
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
                    key: 'playerCharacters',
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
            if (isAuthorized && playerCharacters === null) {
                await fetchPlayerCharacters();
            }
        })();
    }, [isAuthorized, playerCharacters]);

    // Request with params
    useEffect(() => {
        (async (): Promise<void> => {
            if (isAuthorized && playerCharacters !== null) {
                await fetchPlayerCharacters(
                    page + 1,
                    `${order === 'asc' ? '' : '-'}${orderBy}`
                );
            }
        })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, order, orderBy]);

    // Default current state every time new dataset comes in, keep it simple
    useEffect(() => {
        if (playerCharacters) {

            if (multipleSelected.length > 0) {
                setMultipleSelected([]);

                dispatch<UpdateStore<{ selected: number[] }>>(
                    {
                        type: 'UPDATE_STORE',
                        reducer: 'catalogues',
                        key: 'playerCharacters',
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
                        key: 'playerCharacters',
                        payload: {
                            selected: 0
                        }
                    }
                );
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [playerCharacters]);

    const { root, visuallyHidden } = useStyles();

    return playerCharacters !== null && pagination !== null ? (
        <>
            <Table className={root}>
                <TableHead>
                    <TableRow>
                        <TableCell padding="checkbox">
                            {mode === PLAYER_CHARACTER_TABLE_DISPLAY_MODE.TO_SHOW && (
                                <Checkbox
                                    checked={multipleSelected.length === playerCharacters.length}
                                    indeterminate={
                                        multipleSelected.length > 0
                                            && multipleSelected.length < playerCharacters.length
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
                    {playerCharacters.map((playerCharacter, index) => {

                        const isItemSelected = mode === PLAYER_CHARACTER_TABLE_DISPLAY_MODE.TO_SHOW
                            ? isSelected(playerCharacter.id, multipleSelected)
                            : singleSelected === playerCharacter.id;

                        const labelId = `playerCharacter-table-checkbox-${index}`;

                        return (
                            <TableRow
                                hover
                                onClick={handleSelect(playerCharacter.id)}
                                role="checkbox"
                                aria-checked={isItemSelected}
                                tabIndex={-1}
                                key={playerCharacter.name}
                                selected={isItemSelected}
                            >
                                <TableCell padding="checkbox">
                                    {mode === PLAYER_CHARACTER_TABLE_DISPLAY_MODE.TO_SHOW ? (
                                        <Checkbox
                                            checked={isItemSelected}
                                            inputProps={{ 'aria-labelledby': labelId }}
                                        />
                                    ) : (
                                        <Radio
                                            checked={isItemSelected}
                                            inputProps={{ 'aria-labelledby': labelId }}
                                        />
                                    )}
                                </TableCell>

                                <TableCell align="left">
                                    {playerCharacter.name}
                                </TableCell>

                                <TableCell align="right">
                                    {playerCharacter.thread?.name
                                        ?? `${playerCharacter.threadCount} threads`}
                                </TableCell>

                                <TableCell align="right">
                                    {playerCharacter.adventure?.title
                                        ?? `${playerCharacter.adventureCount} adventures`}
                                </TableCell>

                                <TableCell align="right">
                                    {playerCharacter.nonPlayerCharacter?.name
                                        ?? `${playerCharacter.nonPlayerCharacterCount} NPCs`}
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
            <Box mt={2}>
                <TablePagination
                    component="div"
                    rowsPerPage={15}
                    rowsPerPageOptions={[]}
                    count={pagination?.numberOfResults}
                    page={page}
                    onChangePage={handlePageChange}
                />
            </Box>
        </>

    ) : <LinearProgress />;
};

