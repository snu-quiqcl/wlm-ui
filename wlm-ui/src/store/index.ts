import { configureStore } from '@reduxjs/toolkit';

import channelListReducer from "./slices/channel/channel";
import userReducer from "./slices/user/user";

export const store = configureStore({
    reducer: {
        user: userReducer,
        channelList: channelListReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
