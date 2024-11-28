import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
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

interface ChannelFetchType extends ChannelType {
    in_use: boolean;
};

export const fetchList = createAsyncThunk(
    'channel/fetch',
    async () => {
        const response = await axios.get<ChannelFetchType[]>('/channel/');
        return response.data;
    },
);

export const postInUse = createAsyncThunk(
    'channel/postInUse',
    async (payload: Pick<ChannelType, 'channel'> & Pick<ChannelInfo, 'inUse'>) => {
        const newInUse = !payload.inUse;
        await axios.post(`/operation/${payload.channel}/`, { 'on': newInUse });
        return { channel: payload.channel, inUse: newInUse };
    },
);

export const postExposure = createAsyncThunk(
    'channel/postExposure',
    async (payload: Pick<ChannelType, 'channel'> & Pick<ChannelInfo, 'exposure'>) => {
        await axios.post(`/setting/${payload.channel}/`, { exposure: payload.exposure });
    },
);

export const postPeriod = createAsyncThunk(
    'channel/postPeriod',
    async (payload: Pick<ChannelType, 'channel'> & Pick<ChannelInfo, 'period'>) => {
        await axios.post(`/setting/${payload.channel}/`, { period: payload.period });
    },
);

export const channelListSlice = createSlice({
    name: 'channelList',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchList.fulfilled, (state, action) => {
                state.channels = action.payload.map((ch) => {
                    const originalInfo = state.channels.find(
                        info => info.channel.channel === ch.channel
                    );
                    return {
                        channel: { channel: ch.channel, name: ch.name } as ChannelType,
                        inUse: ch.in_use,
                        exposure: originalInfo?.exposure ?? 0,
                        period: originalInfo?.period ?? 0,
                    } as ChannelInfo;
                }).sort((a, b) => a.channel.channel - b.channel.channel);
            })
            .addCase(postInUse.fulfilled, (state, action) => {
                const targetInfo = state.channels.find(
                    info => info.channel.channel === action.payload.channel
                );
                if (targetInfo === undefined) {
                    throw new Error('Channel not found');
                }
                targetInfo.inUse = action.payload.inUse;
            })
    },
});

export const channelListActions = channelListSlice.actions;
export const selectChannelList = (state: RootState) => state.channelList;

export default channelListSlice.reducer;
