import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

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

export const signin = createAsyncThunk(
    'user/signin',
    async (user: Pick<UserType, 'username' | 'password'>) => {
        const response = await axios.post('/user/signin/', user);
        return response.data;
    }
);

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {},
});
