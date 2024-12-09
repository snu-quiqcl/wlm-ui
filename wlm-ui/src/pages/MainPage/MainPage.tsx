import React from 'react';
import { useDispatch } from 'react-redux';

import { AppDispatch } from '../../store';
import { signout } from '../../store/slices/user/user';
import ChannelList from './components/ChannelList/ChannelList';
import EventList from './components/EventList/EventList';

const MainPage = () => {
    const dispatch = useDispatch<AppDispatch>();

    const onClickSignout = async () => {
        dispatch(signout());
    };

    return (
        <div>
            <button onClick={onClickSignout}>Sign out</button>
            <ChannelList />
            <EventList />
        </div>
    );
};

export default MainPage;
