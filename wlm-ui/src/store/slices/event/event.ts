import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from '../..';

export interface EventType {
    category: string;
    content: string;
    occurredAt: string;
};

export interface EventInfo {
    event: EventType;
};

export interface EventListInfo {
    events: EventInfo[];
};

const initialState: EventListInfo = {
    events: [],
};

export const EventListSlice = createSlice({
    name: 'event',
    initialState,
    reducers: {
        fetchEvents: (state, action: PayloadAction<{ events: EventType | EventType[] }>) => {
            const { events } = action.payload;
            if (Array.isArray(events)) {
                state.events = [
                    ...events.reverse().map(event => (
                        { event: event } as EventInfo
                    )), ...state.events];
            } else {
                state.events = [{ event: events } as EventInfo, ...state.events];
            }
        },
    },
});

export const eventListActions = EventListSlice.actions;
export const selectEventList = (state: RootState) => state.eventList;

export default EventListSlice.reducer;
