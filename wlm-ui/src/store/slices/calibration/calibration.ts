import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const calibrate = createAsyncThunk(
    'calibration',
    async () => {
        await axios.post('/calibration/');
    },
);
