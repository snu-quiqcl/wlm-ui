import { createSlice } from '@reduxjs/toolkit';

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
    reducers: {},
});

export const eventListActions = EventListSlice.actions;

export default EventListSlice.reducer;
