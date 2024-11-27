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
    exposure: number;
    period: number;
};

export interface ChannelListInfo {
    channels: ChannelInfo[];
};

const initialState: ChannelListInfo = {
    channels: JSON.parse(localStorage.getItem('channel.channelList') ?? '[]'),
};

export const fetchList = createAsyncThunk(
    'channel/fetch',
    async () => {
        const response = await axios.get<ChannelType[]>('/channel/');
        return response.data;
    },
);

export const postExposure = createAsyncThunk(
    'channel/postExposure',
    async (payload: Pick<ChannelType, 'channel'> & Pick<ChannelInfo, 'exposure'>) => {
        await axios.post(`/setting/${payload.channel}/`, { 'exposure': payload.exposure });
    },
);

export const postPeriod = createAsyncThunk(
    'channel/postPeriod',
    async (payload: Pick<ChannelType, 'channel'> & Pick<ChannelInfo, 'period'>) => {
        await axios.post(`/setting/${payload.channel}/`, { 'period': payload.period });
    },
);

export const channelListSlice = createSlice({
    name: 'channelList',
    initialState,
    reducers: {
        toggleUse: (state, action: PayloadAction<{ channel: number }>) => {
            const targetInfo = state.channels.find(
                (info) => info.channel.channel === action.payload.channel
            );
            if (targetInfo) {
                targetInfo.inUse = !targetInfo.inUse;
            }
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchList.fulfilled, (state, action) => {
                state.channels = action.payload.map((ch) => {
                    const originalInfo = state.channels.find(
                        (info) => info.channel.channel === ch.channel
                    );
                    return <ChannelInfo>({
                        channel: ch,
                        inUse: (originalInfo ? originalInfo.inUse : false),
                    });
                }).sort((a, b) => a.channel.channel - b.channel.channel);
            })
    },
});

export const channelListActions = channelListSlice.actions;
export const selectChannelList = (state: RootState) => state.channelList;

export default channelListSlice.reducer;
