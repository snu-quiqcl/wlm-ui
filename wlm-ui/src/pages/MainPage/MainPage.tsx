import React from 'react';
import Stack from '@mui/material/Stack';

import AppNavBar from './components/AppNavBar/AppNavBar';
import ChannelList from './components/ChannelList/ChannelList';
import EventList from './components/EventList/EventList';

const MainPage = () => {
    return (
        <Stack
            spacing={3}
            sx={{ paddingBottom: 3 }}
        >
            <AppNavBar />
            <Stack
                spacing={4}
                sx={{ paddingX: 3 }}
            >
                <ChannelList />
                <EventList />
            </Stack>
        </Stack>
    );
};

export default MainPage;
