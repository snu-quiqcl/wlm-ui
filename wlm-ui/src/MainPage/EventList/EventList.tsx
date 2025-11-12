import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { AppDispatch } from '../../store';
import { eventListActions, EventType, selectEventList } from '../../store/slices/event/event';
import './EventList.scss';

const EventList = () => {
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

    return (
        <div>
            <h1>Event</h1>
            <div className="event-container">
                {eventListState.events.map((info, index) => {
                    const event = info.event;
                    const timestamp = new Date(event.occurredAt);

                    return (
                        <div key={index} className="event-component">
                            <span style={{ flexBasis: '200px', textAlign: 'left' }}>{timestamp.toLocaleString()}</span>
                            <span style={{ flexBasis: '100px', textAlign: 'left' }}>{event.category}</span>
                            <span style={{ textAlign: 'left' }}>{event.content}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default EventList;
