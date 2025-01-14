import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

import { RootState } from '../..';

axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.xsrfHeaderName = 'X-CSRFToken';

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

const initialState: UserInfo = {
    user: JSON.parse(localStorage.getItem('user.user') ?? 'null'),
};

export const signin = createAsyncThunk(
    'user/signin',
    async (user: Pick<UserType, 'username' | 'password'>) => {
        const response = await axios.post('/user/signin/', user);
        return response.data;
    },
);

export const signout = createAsyncThunk(
    'user/signout',
    async () => {
        await axios.post('/user/signout/');
    },
);

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(signin.fulfilled, (state, action) => {
                state.user = action.payload.user;
                localStorage.setItem('user.user', JSON.stringify(state.user));
            })
            .addCase(signout.fulfilled, (state) => {
                state.user = null;
                localStorage.clear()
            })
    },
});

export const userActions = userSlice.actions;
export const selectUser = (state: RootState) => state.user;

export default userSlice.reducer;
