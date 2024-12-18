import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DataGrid, GridRowsProp, GridColDef, GridToolbar } from '@mui/x-data-grid';

import { AppDispatch } from '../../../../store';
import { eventListActions, EventType, selectEventList } from '../../../../store/slices/event/event';

const EventList = () => {
    const [rows, setRows] = useState<GridRowsProp>([]);
    const columns: GridColDef[] = [
        {
            field: 'occurredAt',
            type: 'dateTime',
            headerName: 'Timestamp',
            flex: 1,
            maxWidth: 200,
        },
        {
            field: 'category',
            type: 'singleSelect',
            valueOptions: [
                'general', 'warning', 'error', 'user', 'operation', 'setting', 'lock', 'config'],
            headerName: 'Category',
            flex: 1,
            maxWidth: 150,
        },
        {
            field: 'content',
            type: 'string',
            headerName: 'Content',
            flex: 2,
            minWidth: 250,
            sortable: false,
        },
    ];
    const eventListState = useSelector(selectEventList);
    const dispatch = useDispatch<AppDispatch>();

    useEffect(() => {
        const socket = new WebSocket(`${process.env.REACT_APP_WEBSOCKET_URL}/event/`);

        socket.onmessage = event => {
            const data = JSON.parse(event.data) as EventType | EventType[];
            dispatch(eventListActions.fetchEvents({ events: data }));
        };

        return () => socket.close();
    }, [dispatch]);

    useEffect(() => {
        setRows(eventListState.events.map((info, index) => {
            const event = info.event;
            return { id: index, ...event, occurredAt: new Date(event.occurredAt) };
        }));
    }, [eventListState.events]);

    return (
        <DataGrid
            rows={rows}
            columns={columns}
            initialState={{
                pagination: { paginationModel: { pageSize: 25 } },
                density: 'compact',
            }}
            pageSizeOptions={[25, 50, 100, { value: -1, label: 'All' }]}
            slots={{ toolbar: GridToolbar }}
            disableColumnSelector
            disableRowSelectionOnClick
            disableDensitySelector
        />
    );
};

export default EventList;
