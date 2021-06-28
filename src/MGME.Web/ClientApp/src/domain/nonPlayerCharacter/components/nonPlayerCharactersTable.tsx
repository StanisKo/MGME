import { ReactElement, useState, useEffect, ChangeEvent, MouseEvent } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { ApplicationState, UpdateStore } from '../../../store';

import { NonPlayerCharacter } from '../interfaces';
import { fetchNonPlayerCharacters } from '../requests';

import { HeadCell, Pagination } from '../../../shared/interfaces';
import { SortOrder } from '../../../shared/const';
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
    Box
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
    { label: 'Name', sorting: 'name', numeric: false },
    { label: 'Adventure', sorting: 'adventure', numeric: true },
    { label: 'Character', sorting: 'character', numeric: true }
];

export const NonPlayerCharactersTable = (): ReactElement | null => {
    const dispatch = useDispatch();

    const isAuthorized: boolean = useSelector(
        (store: ApplicationState) => Boolean(store.auth?.token) ?? false
    );

    const nonPlayerCharacters: NonPlayerCharacter[] | null = useSelector(
        (state: ApplicationState) => state.catalogues?.nonPlayerCharacters?.data ?? null
    );

    const pagination: Pagination | null = useSelector(
        (state: ApplicationState) => state.catalogues?.playerCharacters?.pagination ?? null
    );

    const [page, setPage] = useState(0);
    const [order, setOrder] = useState<SortOrder>('asc');
    const [orderBy, setOrderBy] = useState<string>('name');
    const [selected, setSelected] = useState<number[]>([]);

    const handleSelectAll = (event: ChangeEvent<HTMLInputElement>): void => {
        let newSelected: number[] = [];

        if (event.target.checked) {
            newSelected = (nonPlayerCharacters ?? []).map(
                (nonPlayerCharacter: NonPlayerCharacter) => nonPlayerCharacter.id
            );
        }
        else {
            newSelected = [];
        }

        setSelected(newSelected);

        dispatch<UpdateStore<{ selected: number[] }>>(
            {
                type: 'UPDATE_STORE',
                reducer: 'catalogues',
                key: 'nonPlayerCharacters',
                payload: {
                    selected: newSelected
                }
            }
        );
    };

    const handleSelect = (selectedId: number) => (event: MouseEvent<unknown>): void => {
        let newSelected: number[] = [];

        if (selected.includes(selectedId)) {
            newSelected = selected.filter((id: number) => id !== selectedId);
        }
        else {
            newSelected = [...selected, selectedId];
        }

        setSelected(newSelected);

        dispatch<UpdateStore<{ selected: number[] }>>(
            {
                type: 'UPDATE_STORE',
                reducer: 'catalogues',
                key: 'nonPlayerCharacters',
                payload: {
                    selected: newSelected
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
            if (isAuthorized && nonPlayerCharacters === null) {
                await fetchNonPlayerCharacters();
            }
        })();
    }, [isAuthorized, nonPlayerCharacters]);

    // Request with params
    useEffect(() => {
        (async (): Promise<void> => {
            if (isAuthorized && nonPlayerCharacters !== null) {
                await fetchNonPlayerCharacters(
                    page + 1,
                    `${order === 'asc' ? '' : '-'}${orderBy}`
                );
            }
        })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, order, orderBy]);

    return (
        <div>NPC Table</div>
    );
};
