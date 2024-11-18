import React from 'react';
import { useDispatch } from 'react-redux';

import { AppDispatch } from '../store';
import { signout } from '../store/slices/user/user';

const MainPage = () => {
    const dispatch = useDispatch<AppDispatch>();

    const onClickSignout = async () => {
        dispatch(signout());
    };

    const onClickRefreshChannelList = async () => {
        console.log("refresh channel list");
    }

    return (
        <div>
            <button
                onClick={onClickSignout}
            >
                Sign out
            </button>
            <div>
                <h1>Channel list</h1>
                <button
                    onClick={onClickRefreshChannelList}
                >
                    Refresh
                </button>
            </div>
        </div>
    );
};

export default MainPage;
