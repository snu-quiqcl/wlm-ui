import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import AdjustIcon from '@mui/icons-material/Adjust';
import RefreshIcon from '@mui/icons-material/Refresh';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

import { AppDispatch } from '../../../../store';
import { ChannelInfo, fetchList, selectChannelList } from '../../../../store/slices/channel/channel';
import { calibrate, selectCalibration } from '../../../../store/slices/calibration/calibration';
import Channel from '../Channel/Channel';

const ChannelList = () => {
    const [channels, setChannels] = useState<ChannelInfo[]>([]);
    const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);
    const channelsRef = useRef(channels);
    const channelListState = useSelector(selectChannelList);
    const calibrationState = useSelector(selectCalibration);
    const dispatch = useDispatch<AppDispatch>();

    useEffect(() => {
        dispatch(fetchList());
    }, [dispatch]);

    useEffect(() => {
        channelsRef.current = channels;
    }, [channels]);

    useEffect(() => {
        const newChannels = [...channelListState.channels].sort((a, b) => {
            const idx_a = channelsRef.current.findIndex(
                info => info.channel.channel === a.channel.channel);
            const idx_b = channelsRef.current.findIndex(
                info => info.channel.channel === b.channel.channel);
            
            if (idx_a !== -1 && idx_b !== -1) {
                return idx_a - idx_b;
            } else if (idx_a === -1 && idx_b === -1) {
                return a.channel.channel - b.channel.channel;
            } else {
                return idx_a === -1 ? 1 : -1;
            }
        });

        setChannels(newChannels);
    }, [channelListState.channels]);

    useEffect(() => {
        if (calibrationState.isCalibrated === false) {
            setOpenSnackbar(true);
        }
    }, [calibrationState.isCalibrated]);

    const onClickRefreshChannelList = async () => {
        dispatch(fetchList());
    };

    const onDragEnd = (result: DropResult) => {
        const { source, destination } = result;

        if (!destination) {
            return;
        }

        const newChannels = [...channels];
        const [info] = newChannels.splice(source.index, 1);
        newChannels.splice(destination.index, 0, info);
        setChannels(newChannels);
    }

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
            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="droppable" direction='horizontal'>
                    {(droppableProvided) => (
                        <Box
                            ref={droppableProvided.innerRef}
                            sx={{
                                display: 'flex',
                                flexDirection: 'row',
                                flexWrap: 'wrap',
                                gap: 2,
                            }}
                        >
                            {channels.map((info, index) => (
                                <Draggable
                                    key={info.channel.channel}
                                    draggableId={info.channel.channel.toString()}
                                    index={index}
                                >
                                    {(draggableProvided) => (
                                        <Box
                                            ref={draggableProvided.innerRef}
                                            {...draggableProvided.draggableProps}
                                        >
                                            <Channel
                                                key={info.channel.channel}
                                                dragHandleProps={draggableProvided.dragHandleProps}
                                                {...info}
                                            />
                                        </Box>
                                    )}
                                </Draggable>
                            ))}
                        </Box>
                    )}
                </Droppable>
            </DragDropContext>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    gap: 2,
                }}
            >
                
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
