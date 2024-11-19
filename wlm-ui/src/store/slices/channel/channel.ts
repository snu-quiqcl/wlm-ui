import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

import { RootState } from '../..';

export interface ChannelType {
    channel: number;
    name: string;
};

export interface ChannelInfo {
    channel: ChannelType;
    inUse: boolean;
};

export interface ChannelListInfo {
    channels: ChannelInfo[];
};

const initialState: ChannelListInfo = {
    channels: JSON.parse(localStorage.getItem('channel.channelList') ?? '[]'),
};

export const fetch = createAsyncThunk(
    'channel/fetch',
    async () => {
        const response = await axios.get<ChannelType[]>('/channel/');
        return response.data;
    },
);

export const channelListSlice = createSlice({
    name: 'channelList',
    initialState,
    reducers: {
        toggleUse: (state, action: PayloadAction<{ channel: number }>) => {
            const info = state.channels.find(
                (chinfo) => chinfo.channel.channel === action.payload.channel
            );
            if (info) {
                info.inUse = !info.inUse;
            }
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetch.fulfilled, (state, action) => {
                const channels = action.payload.map((ch) => ch.channel);
                const duplicates = state.channels
                    .filter((info) => channels.includes(info.channel.channel));
                const newInfos = action.payload
                    .filter(
                        (ch) => !duplicates.map(
                            (info) => info.channel.channel
                        ).includes(ch.channel)
                    ).map((ch) => <ChannelInfo>({ channel: ch, inUse: false }));
                state.channels = duplicates.concat(newInfos).sort(
                    (a, b) => a.channel.channel - b.channel.channel
                );
            })
    },
});

export const channelListActions = channelListSlice.actions;
export const selectChannelList = (state: RootState) => state.channelList;

export default channelListSlice.reducer;
