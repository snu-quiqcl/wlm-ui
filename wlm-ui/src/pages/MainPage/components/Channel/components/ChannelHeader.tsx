import React from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid2';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import { OperationType, LockType } from '../../../../../store/slices/channel/channel';

type Props = {
    channel: number;
    channelName: string;
    operation: OperationType;
    lock: LockType;
    inUse: boolean;
    hasLock: boolean;
    isInUseButtonEnabled: boolean;
    isLockButtonEnabled: boolean;
    areAllSocketsConnected: boolean;
    requestersText: string;
    lockText: string;
    onInUseChange: (inUse: boolean) => void;
    onLockToggle: () => void;
    onInUseButtonEnabledChange: (enabled: boolean) => void;
};

const ChannelHeader = ({
    channel,
    channelName,
    operation,
    lock,
    inUse,
    hasLock,
    isInUseButtonEnabled,
    isLockButtonEnabled,
    areAllSocketsConnected,
    requestersText,
    lockText,
    onInUseChange,
    onLockToggle,
    onInUseButtonEnabledChange,
}: Props) => {
    return (
        <Stack
            direction='row'
            sx={{ justifyContent: 'space-between', alignItems: 'center' }}
        >
            <Stack sx={{ alignItems: 'flex-start' }}>
                <Typography
                    component='h1'
                    variant='h6'
                    sx={{ fontWeight: 'bold' }}
                >
                    Channel {channel}
                </Typography>
                <Typography component='h2' variant='subtitle1'>
                    {channelName}
                </Typography>
            </Stack>
            {areAllSocketsConnected ? (
                <Grid container sx={{ width: 140 }}>
                    <Grid
                        container
                        size={12}
                        sx={{ display: 'flex', alignItems: 'center' }}
                    >
                        <Grid
                            size={5.5}
                            sx={{ display: 'flex', justifyContent: 'flex-start' }}
                        >
                            <Tooltip title={requestersText} placement='top'>
                                <Typography variant='overline'>
                                    {operation.on ? 'on' : 'off'}
                                </Typography>
                            </Tooltip>
                        </Grid>
                        <Grid
                            size={2}
                            sx={{ display: 'flex', justifyContent: 'center' }}
                        >
                            <Box
                                sx={{
                                    width: '12px',
                                    height: '12px',
                                    backgroundColor: operation.on ? 'green' : 'grey',
                                    borderRadius: '50%',
                                }}
                            />
                        </Grid>
                        <Grid
                            size={4.5}
                            sx={{ display: 'flex', justifyContent: 'flex-end' }}
                        >
                            <Switch
                                checked={inUse}
                                disabled={!isInUseButtonEnabled}
                                size='small'
                                onChange={() => {
                                    onInUseButtonEnabledChange(false);
                                    onInUseChange(inUse);
                                }}
                            />
                        </Grid>
                    </Grid>
                    <Grid
                        container
                        size={12}
                        sx={{ display: 'flex', alignItems: 'center' }}
                    >
                        <Grid
                            size={5.5}
                            sx={{ display: 'flex', justifyContent: 'flex-start' }}
                        >
                            <Tooltip title={lockText} placement='top'>
                                <Typography variant='overline'>
                                    {lock.locked ? 'LOCKED' : 'OPEN'}
                                </Typography>
                            </Tooltip>
                        </Grid>
                        <Grid
                            size={2}
                            sx={{ display: 'flex', justifyContent: 'center' }}
                        >
                            {lock.locked ? (
                                <LockIcon fontSize='small' />
                            ) : (
                                <LockOpenIcon fontSize='small' />
                            )}
                        </Grid>
                        <Grid
                            size={4.5}
                            sx={{ display: 'flex', justifyContent: 'flex-end' }}
                        >
                            <Switch
                                checked={hasLock}
                                disabled={
                                    !(
                                        isLockButtonEnabled &&
                                        (!lock.locked || hasLock)
                                    )
                                }
                                size='small'
                                onChange={() => {
                                    onLockToggle();
                                }}
                            />
                        </Grid>
                    </Grid>
                </Grid>
            ) : (
                <Skeleton variant='rounded' width={140} height={50} />
            )}
        </Stack>
    );
};

export default ChannelHeader;
