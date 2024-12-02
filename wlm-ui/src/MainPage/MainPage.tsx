import React from 'react';
import { useDispatch } from 'react-redux';

import { AppDispatch } from '../store';
import { signout } from '../store/slices/user/user';
import { calibrate } from '../store/slices/calibration/calibration';
import ChannelList from './Channel/ChannelList';

const MainPage = () => {
    const dispatch = useDispatch<AppDispatch>();

    const onClickSignout = async () => {
        dispatch(signout());
    };

    const onClickCalibration = async () => {
        dispatch(calibrate());
    };

    return (
        <div>
            <button onClick={onClickCalibration}>Calibration</button>
            <button onClick={onClickSignout}>Sign out</button>
            <ChannelList />
        </div>
    );
};

export default MainPage;
