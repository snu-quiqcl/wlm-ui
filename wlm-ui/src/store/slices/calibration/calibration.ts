import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

import { RootState } from '../..';

export interface CalibrationInfo {
    isCalibrated?: boolean;
};

const initialState: CalibrationInfo = {};

export const calibrate = createAsyncThunk(
    'calibration',
    async () => {
        await axios.post('/calibration/');
    },
);

export const calibrationSlice = createSlice({
    name: 'calibration',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(calibrate.pending, (state) => {
                state.isCalibrated = undefined;
            })
            .addCase(calibrate.fulfilled, (state) => {
                state.isCalibrated = true;
            })
            .addCase(calibrate.rejected, (state) => {
                state.isCalibrated = false;
            })
    },
});

export const calibrationActions = calibrationSlice.actions;
export const selectCalibration = (state: RootState) => state.calibration;

export default calibrationSlice.reducer;
