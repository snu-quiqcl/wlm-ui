import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from 'axios';

import { RootState } from "../..";

export interface ChannelType {
    channel: number;
    name: string;
};

export interface ChannelInfo {
    channel: ChannelType;
    inUse: Boolean;
}

export interface ChannelListInfo {
    channels: ChannelInfo[];
}

const initialState: ChannelListInfo = {
    channels: JSON.parse(localStorage.getItem('channel.channelList') ?? '[]'),
};

export const fetch = createAsyncThunk(
    'channel/fetch',
    async () => {
        const response = await axios.get<ChannelType[]>('/channel/');
        return response.data;
    }
)

export const channelListSlice = createSlice({
    name: 'channelList',
    initialState,
    reducers: {},
})

export const selectChannelList = (state: RootState) => state.channelList;

export default channelListSlice.reducer;