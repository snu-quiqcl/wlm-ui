import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

import { RootState } from '../..';

export interface ChannelType {
    channel: number;
    name: string;
};

export interface SettingType {
    exposure: number;
    period: number;
};

export interface ChannelInfo {
    channel: ChannelType;
    inUse: boolean;
    setting: SettingType;
};

export interface ChannelListInfo {
    channels: ChannelInfo[];
};

const initialState: ChannelListInfo = {
    channels: [],
};

export const fetchList = createAsyncThunk(
    'channel/fetch',
    async () => {
        const response = await axios.get<(ChannelType & Pick<ChannelInfo, 'inUse'>)[]>('/channel/');
        return response.data;
    },
);

export const postInUse = createAsyncThunk(
    'channel/postInUse',
    async (payload: Pick<ChannelType, 'channel'> & Pick<ChannelInfo, 'inUse'>) => {
        const { channel, inUse } = payload;
        const newInUse = !inUse;
        await axios.post(`/operation/${channel}/`, { 'on': newInUse });
        return { channel: channel, inUse: newInUse };
    },
);

export const postExposure = createAsyncThunk(
    'channel/postExposure',
    async (payload: Pick<ChannelType, 'channel'> & Pick<SettingType, 'exposure'>) => {
        await axios.post(`/setting/${payload.channel}/`, { exposure: payload.exposure });
    },
);

export const postPeriod = createAsyncThunk(
    'channel/postPeriod',
    async (payload: Pick<ChannelType, 'channel'> & Pick<SettingType, 'period'>) => {
        await axios.post(`/setting/${payload.channel}/`, { period: payload.period });
    },
);

export const channelListSlice = createSlice({
    name: 'channelList',
    initialState,
    reducers: {
        fetchSetting: (
            state, action: PayloadAction<Pick<ChannelType, 'channel'> & Partial<SettingType>>
        ) => {
            
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchList.fulfilled, (state, action) => {
                state.channels = action.payload.map((ch) => {
                    const originalInfo = state.channels.find(
                        info => info.channel.channel === ch.channel
                    );
                    return {
                        channel: { channel: ch.channel, name: ch.name },
                        inUse: ch.inUse,
                        setting: originalInfo?.setting ?? { exposure: 0, period: 0 },
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
