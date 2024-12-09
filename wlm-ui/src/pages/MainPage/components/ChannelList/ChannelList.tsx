import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import AdjustIcon from '@mui/icons-material/Adjust';
import RefreshIcon from '@mui/icons-material/Refresh';

import { AppDispatch } from '../../../../store';
import { fetchList, selectChannelList } from '../../../../store/slices/channel/channel';
import { calibrate, selectCalibration } from '../../../../store/slices/calibration/calibration';
import Channel from '../Channel/Channel';

const ChannelList = () => {
    const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);
    const channelListState = useSelector(selectChannelList);
    const calibrationState = useSelector(selectCalibration);
    const dispatch = useDispatch<AppDispatch>();

    useEffect(() => {
        dispatch(fetchList());
    }, [dispatch]);

    useEffect(() => {
        if (calibrationState.isCalibrated === false) {
            setOpenSnackbar(true);
        }
    }, [calibrationState.isCalibrated]);

    const onClickRefreshChannelList = async () => {
        dispatch(fetchList());
    };

    const onClickCalibration = async () => {
        dispatch(calibrate());
    };

    return (
        <Stack spacing={2}>
            <Stack
                direction='row'
                sx={{ justifyContent: 'space-between' }}
            >
                <Button
                    variant='contained'
                    size='small'
                    endIcon={<RefreshIcon />}
                    onClick={onClickRefreshChannelList}
                >
                    refresh
                </Button>
                <Button
                    variant='contained'
                    size='small'
                    color='secondary'
                    endIcon={<AdjustIcon />}
                    onClick={onClickCalibration}
                >
                    calibrate
                </Button>
            </Stack>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    gap: 2,
                }}
            >
                {channelListState.channels.map(info => (
                    <Channel
                        key={info.channel.channel}
                        {...info}
                    />
                ))}
            </Box>
            <Snackbar
                open={openSnackbar}
                autoHideDuration={3000}
                message='Calibration failed'
                onClose={() => setOpenSnackbar(false)}
            />
        </Stack>
    );
};

export default ChannelList;
