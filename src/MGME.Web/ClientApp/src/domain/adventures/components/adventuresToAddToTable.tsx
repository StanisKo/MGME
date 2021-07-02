import { ReactElement, useState, useEffect, MouseEvent } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { ApplicationState, UpdateStore } from '../../../store';

import { Adventure } from '../interfaces';

import { fetchAdventures } from '../requests';

import { HeadCell, Pagination } from '../../../shared/interfaces';
import { SortOrder } from '../../../shared/const';

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

const headCells: HeadCell[] = [
    { label: 'Title', sorting: 'title', numeric: false },
    { label: 'Thread', sorting: 'thread', numeric: true },
    { label: 'Character', sorting: 'character', numeric: true },
    { label: 'NPC', sorting: 'npc', numeric: true }
];

export const AdventuresToAddToTable = (): ReactElement => {
    const dispatch = useDispatch();

    const isAuthorized: boolean = useSelector(
        (store: ApplicationState) => Boolean(store.auth?.token) ?? false
    );

    const adventures: Adventure[] | null = useSelector(
        (state: ApplicationState) => state.catalogues?.adventures?.data ?? null
    );

    const pagination: Pagination | null = useSelector(
        (state: ApplicationState) => state.catalogues?.adventures?.pagination ?? null
    );

    const [page, setPage] = useState(0);
    const [order, setOrder] = useState<SortOrder>('asc');
    const [orderBy, setOrderBy] = useState<string>('name');
    const [selected, setSelected] = useState<number>(0);

    const handleSelect = (selectedId: number) => (event: MouseEvent<unknown>): void => {
        setSelected(selectedId);

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
            if (isAuthorized && adventures === null) {
                await fetchAdventures('catalogues');
            }
        })();
    }, [isAuthorized, adventures]);

    // Request with params
    useEffect(() => {
        (async (): Promise<void> => {
            if (isAuthorized && adventures !== null) {
                await fetchAdventures(
                    'catalogues',
                    page + 1,
                    `${order === 'asc' ? '' : '-'}${orderBy}`
                );
            }
        })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, order, orderBy]);

    // Default current state every time new dataset comes in, keep it simple
    useEffect(() => {
        if (adventures && selected > 0) {
            setSelected(0);

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
    }, [adventures]);

    const { root, visuallyHidden } = useStyles();

    return adventures !== null && pagination !== null ? (
        <>
            <Table className={root}>
                <TableHead>
                    <TableRow>
                        <TableCell padding="checkbox" />
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
                    {adventures.map((adventure, index) => {
                        const isItemSelected = selected === adventure.id;
                        const labelId = `adventure-table-checkbox-${index}`;

                        return (
                            <TableRow
                                hover
                                onClick={handleSelect(adventure.id)}
                                role="checkbox"
                                aria-checked={isItemSelected}
                                tabIndex={-1}
                                key={adventure.title}
                                selected={isItemSelected}
                            >
                                <TableCell padding="checkbox">
                                    <Radio
                                        checked={isItemSelected}
                                        inputProps={{ 'aria-labelledby': labelId }}
                                    />
                                </TableCell>

                                <TableCell align="left">
                                    {adventure.title}
                                </TableCell>

                                <TableCell align="right">
                                    {adventure.thread?.name
                                        ?? `${adventure.threadCount} threads`}
                                </TableCell>

                                <TableCell align="right">
                                    {adventure.playerCharacter?.name
                                        ?? `${adventure.playerCharacterCount} Characters`}
                                </TableCell>

                                <TableCell align="right">
                                    {adventure.nonPlayerCharacter?.name
                                        ?? `${adventure.nonPlayerCharacterCount} NPCs`}
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
