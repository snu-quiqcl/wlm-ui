import { createSlice } from "@reduxjs/toolkit";
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

export const channelListSlice = createSlice({
    name: 'channelList',
    initialState,
    reducers: {},
})

export const selectChannelList = (state: RootState) => state.channelList;

export default channelListSlice.reducer;