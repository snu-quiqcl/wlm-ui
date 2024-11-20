import React from 'react';
import { useDispatch } from 'react-redux';

import { AppDispatch } from '../store';
import { signout } from '../store/slices/user/user';
import { fetchList } from '../store/slices/channel/channel';
import ChannelListTable from './ChannelList';

const MainPage = () => {
    const dispatch = useDispatch<AppDispatch>();

    const onClickSignout = async () => {
        dispatch(signout());
    };

    const onClickRefreshChannelList = async () => {
        dispatch(fetchList());
    };

    return (
        <div>
            <button onClick={onClickSignout}>Sign out</button>
            <div>
                <h1>Channel list</h1>
                <button onClick={onClickRefreshChannelList}>Refresh</button>
                <ChannelListTable />
            </div>
        </div>
    );
};

export default MainPage;
