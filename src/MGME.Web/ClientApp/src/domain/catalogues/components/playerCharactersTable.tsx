import { ReactElement, useState, useEffect, ChangeEvent, MouseEvent } from 'react';
import { useSelector } from 'react-redux';

import { PlayerCharacter } from '../interfaces';
import { fetchPlayerCharacters } from '../requests';

import { HeadCell } from '../../../shared/interfaces';
import { SortOrder } from '../../../shared/const';
import { ApplicationState } from '../../../store';

import { TableHead, TableRow, TableCell, Checkbox, TableSortLabel, LinearProgress } from '@material-ui/core';

const headCells: HeadCell[] = [
    { label: 'Name', sorting: 'name', numeric: false },
    { label: 'Adventure', sorting: 'adventure', numeric: true },
    { label: 'NPC', sorting: 'npc', numeric: true }
];

export const PlayerCharactersTable = (): ReactElement | null => {
    const playerCharacters: PlayerCharacter[] | null = useSelector(
        (state: ApplicationState) => state.catalogues?.playerCharacters?.data ?? null
    );

    const isAuthorized: boolean = useSelector(
        (store: ApplicationState) => Boolean(store.auth?.token) ?? false
    );

    const [order, setOrder] = useState<SortOrder>('asc');
    const [orderBy, setOrderBy] = useState<keyof PlayerCharacter>('name');
    // const [selected, setSelected] = useState<number[]>([]);
    // const [page, setPage] = useState(0);

    const handleSelectAll = (event: ChangeEvent<HTMLInputElement>): void => {

    };

    const handleSorting = (event: MouseEvent<unknown>): void => {
        
    };

    useEffect(() => {
        (async (): Promise<void> => {
            if (isAuthorized && playerCharacters === null) {
                await fetchPlayerCharacters();
            }
        })();
    }, [isAuthorized, playerCharacters]);

    return playerCharacters !== null ? (
        <TableHead>
            <TableRow>
                <TableCell padding="checkbox">
                    <Checkbox
                        checked={}
                        onChange={handleSelectAll}
                    />
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
                            onClick={handleSorting}
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
    
    ) : <LinearProgress />; // Change for skeleton
};

