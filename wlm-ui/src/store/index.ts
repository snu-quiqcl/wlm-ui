import { configureStore } from '@reduxjs/toolkit';

import userReducer from './slices/user/user';
import channelListReducer from './slices/channel/channel';
import eventListReducer from './slices/event/event';

export const store = configureStore({
    reducer: {
        user: userReducer,
        channelList: channelListReducer,
        eventList: eventListReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
