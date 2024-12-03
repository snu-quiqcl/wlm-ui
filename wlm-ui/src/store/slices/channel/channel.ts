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

export interface MeasurementType {
    frequency: number | null;
    error: string | null;
    measuredAt: string;
};

export interface LockType {
    locked: boolean;
    owner: string | null;
};

export interface ChannelInfo {
    channel: ChannelType;
    inUse: boolean;
    setting: SettingType;
    measurements: MeasurementType[];
    hasLock: boolean;
    lock: LockType;
};

export interface ChannelListInfo {
    channels: ChannelInfo[];
};

const initialState: ChannelListInfo = {
    channels: [],
};

const getChannelInfo = (state: ChannelListInfo, channel: number) => (
    state.channels.find(info => info.channel.channel === channel)
);

const getChannelInfoWithException = (state: ChannelListInfo, channel: number) => {
    const info = getChannelInfo(state, channel);
    if (info === undefined) {
        throw new Error('Channel not found');
    }
    return info;
};

export const fetchList = createAsyncThunk(
    'channel/fetch',
    async () => {
        const response = await axios.get<
            (ChannelType & Pick<ChannelInfo, 'inUse' | 'hasLock'>)[]>('/channel/');
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

export const tryLock = createAsyncThunk(
    'channel/tryLock',
    async (payload: Pick<ChannelType, 'channel'>) => {
        const { channel } = payload;
        await axios.post(`/lock/${channel}/try/`);
        return { channel: channel };
    },
);

export const releaseLock = createAsyncThunk(
    'channel/releaseLock',
    async (payload: Pick<ChannelType, 'channel'>) => {
        const { channel } = payload;
        await axios.put(`/lock/${channel}/release/`);
        return { channel: channel };
    },
);

export const channelListSlice = createSlice({
    name: 'channelList',
    initialState,
    reducers: {
        fetchSetting: (
            state, action: PayloadAction<Pick<ChannelType, 'channel'> & Partial<SettingType>>
        ) => {
            const { channel, exposure, period } = action.payload;
            const info = getChannelInfoWithException(state, channel);
            if (exposure !== undefined) {
                info.setting.exposure = exposure;
            }
            if (period !== undefined) {
                info.setting.period = period;
            }
        },
        fetchMeasurements: (
            state,
            action: PayloadAction<
                Pick<ChannelType, 'channel'> & { measurements: MeasurementType | MeasurementType[] }>
        ) => {
            const { channel, measurements } = action.payload;
            const info = getChannelInfoWithException(state, channel);
            if (Array.isArray(measurements)) {
                info.measurements.push(...measurements);
            } else {
                info.measurements.push(measurements);
            }
        },
        fetchLock: (
            state, action: PayloadAction<Pick<ChannelType, 'channel'> & { lock: LockType }>
        ) => {
            const { channel, lock } = action.payload;
            const info = getChannelInfoWithException(state, channel);
            info.lock = lock;
        },
        removeOldMeasurements: (state, action: PayloadAction<Pick<ChannelType, 'channel'>>) => {
            const info = getChannelInfoWithException(state, action.payload.channel);
            const cutoffTime = new Date(Date.now() - 10 * 60 * 1000);
            info.measurements = info.measurements.filter(
                measurement => new Date(measurement.measuredAt) > cutoffTime);
        },
        removeAllMeasurements: (state, action: PayloadAction<Pick<ChannelType, 'channel'>>) => {
            const info = getChannelInfoWithException(state, action.payload.channel);
            info.measurements = [];
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchList.fulfilled, (state, action) => {
                state.channels = action.payload.map((ch) => {
                    const info = getChannelInfo(state, ch.channel);
                    return {
                        channel: { channel: ch.channel, name: ch.name },
                        inUse: ch.inUse,
                        setting: info?.setting ?? { exposure: 0, period: 0 },
                        measurements: info?.measurements ?? [],
                        hasLock: ch.hasLock,
                        lock: info?.lock ?? { locked: false, owner: null },
                    } as ChannelInfo;
                }).sort((a, b) => a.channel.channel - b.channel.channel);
            })
            .addCase(postInUse.fulfilled, (state, action) => {
                const info = getChannelInfoWithException(state, action.payload.channel);
                info.inUse = action.payload.inUse;
            })
            .addCase(tryLock.fulfilled, (state, action) => {
                const info = getChannelInfoWithException(state, action.payload.channel);
                info.hasLock = true;
            })
            .addCase(releaseLock.fulfilled, (state, action) => {
                const info = getChannelInfoWithException(state, action.payload.channel);
                info.hasLock = false;
            })
    },
});

export const channelListActions = channelListSlice.actions;
export const selectChannelList = (state: RootState) => state.channelList;

export default channelListSlice.reducer;
