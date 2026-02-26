import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

import { RootState } from '../..';

export interface ChannelType {
    channel: number;
    name: string;
    hasDacInfo: boolean;
};

export interface OperationType {
    on: boolean;
    requesters: string[];
};

export interface SettingType {
    exposure: number;
    period: number;
};

export interface DacOutputType {
    voltage: number;
};

export interface PidSettingType {
    targetFrequency: number;
    kp: number;
    ki: number;
    kd: number;
};

export interface PidType {
    on: boolean;
    dacOutput: DacOutputType;
    setting: PidSettingType;
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
    operation: OperationType;
    setting: SettingType;
    hasPid: boolean;
    pid: PidType;
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
            (ChannelType & Pick<ChannelInfo, 'inUse' | 'hasLock' | 'hasPid'>)[]>('/api/channel/');
        return response.data;
    },
);

export const postInUse = createAsyncThunk(
    'channel/postInUse',
    async (payload: Pick<ChannelType, 'channel'> & Pick<ChannelInfo, 'inUse'>) => {
        const { channel, inUse } = payload;
        const newInUse = !inUse;
        await axios.post(`/api/operation/${channel}/`, { 'on': newInUse });
        return { channel: channel, inUse: newInUse };
    },
);

export const postSetting = createAsyncThunk(
    'channel/postSetting',
    async (payload: Pick<ChannelType, 'channel'> & Partial<SettingType>) => {
        const data = { exposure: payload.exposure, period: payload.period };
        await axios.post(`/api/setting/${payload.channel}/`, data);
    },
);

export const postPidOperation = createAsyncThunk(
    'channel/postPidOperation',
    async (payload: Pick<ChannelType, 'channel'> & Pick<ChannelInfo, 'hasPid'>) => {
        const { channel, hasPid } = payload;
        const newHasPid = !hasPid;
        await axios.post(`/api/pid_operation/${channel}/`, { 'on': newHasPid });
        return { channel: channel, hasPid: newHasPid };
    },
);

export const postPidSetting = createAsyncThunk(
    'channel/postPidSetting',
    async (payload: Pick<ChannelType, 'channel'> & Partial<PidSettingType>) => {
        const data = {
            target_frequency: payload.targetFrequency,
            kp: payload.kp,
            ki: payload.ki,
            kd: payload.kd,
        }
        await axios.post(`/api/pid_setting/${payload.channel}/`, data);
    },
);

export const tryLock = createAsyncThunk(
    'channel/tryLock',
    async (payload: Pick<ChannelType, 'channel'>) => {
        const { channel } = payload;
        await axios.post(`/api/lock/${channel}/try/`);
        return { channel: channel };
    },
);

export const releaseLock = createAsyncThunk(
    'channel/releaseLock',
    async (payload: Pick<ChannelType, 'channel'>) => {
        const { channel } = payload;
        await axios.put(`/api/lock/${channel}/release/`);
        return { channel: channel };
    },
);

export const channelListSlice = createSlice({
    name: 'channel',
    initialState,
    reducers: {
        fetchOperation: (
            state,
            action: PayloadAction<Pick<ChannelType, 'channel'> & { operation: OperationType }>
        ) => {
            const { channel, operation } = action.payload;
            const info = getChannelInfoWithException(state, channel);
            info.operation = operation;
        },
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
        fetchPidOperation: (
            state,
            action: PayloadAction<Pick<ChannelType, 'channel'> & Pick<PidType, 'on'>>
        ) => {
            const { channel, on } = action.payload;
            const info = getChannelInfoWithException(state, channel);
            info.pid.on = on;
        },
        fetchPidSetting: (
            state,
            action: PayloadAction<Pick<ChannelType, 'channel'> & Partial<PidSettingType>>
        ) => {
            const { channel, targetFrequency, kp, ki, kd } = action.payload;
            const info = getChannelInfoWithException(state, channel);
            if (targetFrequency !== undefined) {
                info.pid.setting.targetFrequency = targetFrequency;
            }
            if (kp !== undefined) {
                info.pid.setting.kp = kp;
            }
            if (ki !== undefined) {
                info.pid.setting.ki = ki;
            }
            if (kd !== undefined) {
                info.pid.setting.kd = kd;
            }
        },
        fetchPidDacOutput: (
            state,
            action: PayloadAction<Pick<ChannelType, 'channel'> & Pick<DacOutputType, 'voltage'>>
        ) => {
            const { channel, voltage } = action.payload;
            const info = getChannelInfoWithException(state, channel);
            info.pid.dacOutput.voltage = voltage;
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
                        channel: { channel: ch.channel, name: ch.name, hasDacInfo: ch.hasDacInfo },
                        inUse: ch.inUse,
                        operation: info?.operation ?? { on: false, requesters: [] },
                        setting: info?.setting ?? { exposure: 0, period: 0 },
                        hasPid: ch.hasPid,
                        pid: info?.pid ?? { 
                            on: false, 
                            dacOutput: { voltage: 0 },
                            setting: {
                                targetFrequency: 0,
                                kp: 0,
                                ki: 0,
                                kd: 0,
                            },
                        },
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
            .addCase(postPidOperation.fulfilled, (state, action) => {
                const info = getChannelInfoWithException(state, action.payload.channel);
                info.hasPid = action.payload.hasPid;
            })
    },
});

export const channelListActions = channelListSlice.actions;
export const selectChannelList = (state: RootState) => state.channelList;

export default channelListSlice.reducer;
