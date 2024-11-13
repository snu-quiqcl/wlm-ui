import { createSlice } from '@reduxjs/toolkit';

export interface TeamType {
    id: number;
    name: string;
};

export interface UserType {
    id: number,
    username: string,
    password: string,
    team: TeamType;
};

export interface UserInfo {
    user: UserType | null;
};

const initialState: UserInfo = { user: null };

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {},
});
