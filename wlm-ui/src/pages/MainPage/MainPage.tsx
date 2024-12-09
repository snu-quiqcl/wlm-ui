import React from 'react';

import AppNavBar from './components/AppNavBar/AppNavBar';
import ChannelList from './components/ChannelList/ChannelList';
import EventList from './components/EventList/EventList';

const MainPage = () => {
    return (
        <div>
            <AppNavBar />
            <ChannelList />
            <EventList />
        </div>
    );
};

export default MainPage;
