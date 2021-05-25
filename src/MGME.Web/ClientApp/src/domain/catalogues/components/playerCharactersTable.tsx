import { ReactElement, useState, useEffect, ChangeEvent, MouseEvent } from 'react';
import { useSelector } from 'react-redux';

import { PlayerCharacter } from '../interfaces';
import { fetchPlayerCharacters } from '../requests';

import { HeadCell } from '../../../shared/interfaces';
import { isSelected } from '../../../shared/helpers';
import { SortOrder } from '../../../shared/const';
import { ApplicationState } from '../../../store';

import {
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    Checkbox,
    TableSortLabel,
    LinearProgress
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
    const [orderBy, setOrderBy] = useState<string>('name');
    const [selected, setSelected] = useState<number[]>([]);
    // const [page, setPage] = useState(0);

    const handleSelectAll = (event: ChangeEvent<HTMLInputElement>): void => {
        if (event.target.checked) {
            setSelected(
                (playerCharacters ?? []).map((playerCharacter: PlayerCharacter) => playerCharacter.id)
            );

            return;
        }

        setSelected([]);
    };

    const handleSelect = (selectedId: number) => (event: MouseEvent<unknown>): void => {
        if (selected.includes(selectedId)) {
            setSelected(
                selected.filter((id: number) => id !== selectedId)
            );

            return;
        }

        setSelected(
            [...selected, selectedId]
        );
    };

    const handleSorting = (newSortingParam: string) => (event: MouseEvent<unknown>): void => {
        const isAsc = orderBy === newSortingParam && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(newSortingParam);
    };

    useEffect(() => {
        (async (): Promise<void> => {
            if (isAuthorized && playerCharacters === null) {
                await fetchPlayerCharacters();
            }
        })();
    }, [isAuthorized, playerCharacters]);

    const { root, visuallyHidden } = useStyles();

    return playerCharacters !== null ? (
        <Table className={root}>
            <TableHead>
                <TableRow>
                    <TableCell padding="checkbox">
                        <Checkbox
                            checked={selected.length === playerCharacters.length}
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
                                onClick={handleSorting(headCell.sorting)}
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
                    const isItemSelected = isSelected(playerCharacter.id, selected);
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
                                <Checkbox
                                    checked={isItemSelected}
                                    inputProps={{ 'aria-labelledby': labelId }}
                                />
                            </TableCell>

                            <TableCell align="left">
                                {playerCharacter.name}
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
    
    ) : <LinearProgress />;
};

