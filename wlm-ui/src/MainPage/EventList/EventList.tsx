import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { AppDispatch } from '../../store';
import { eventListActions, EventType } from '../../store/slices/event/event';
import './EventList.scss';

const EventList = () => {
    const dispatch = useDispatch<AppDispatch>();

    useEffect(() => {
        const socket = new WebSocket(`${process.env.REACT_APP_WEBSOCKET_URL}/event/`);

        socket.onmessage = event => {
            const data = JSON.parse(event.data) as EventType;
            dispatch(eventListActions.fetchEvent({ event: data }));
        };

        return () => socket.close();
    }, [dispatch]);

    return (
        <div>
            
        </div>
    );
};

export default EventList;
