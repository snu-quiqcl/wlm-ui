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
import { OperationType, LockType, PidType } from '../../../../../store/slices/channel/channel';

type Props = {
    channel: number;
    channelName: string;
    operation: OperationType;
    lock: LockType;
    pid: PidType;
    inUse: boolean;
    hasLock: boolean;
    hasPid: boolean;
    isInUseButtonEnabled: boolean;
    isLockButtonEnabled: boolean;
    isPidButtonEnabled: boolean;
    areAllSocketsConnected: boolean;
    requestersText: string;
    lockText: string;
    onInUseChange: (inUse: boolean) => void;
    onLockToggle: (hasLock: boolean) => void;
    onPidToggle: (hasPid: boolean) => void;
};

const ChannelHeader = ({
    channel,
    channelName,
    operation,
    lock,
    pid,
    inUse,
    hasLock,
    hasPid,
    isInUseButtonEnabled,
    isLockButtonEnabled,
    isPidButtonEnabled,
    areAllSocketsConnected,
    requestersText,
    lockText,
    onInUseChange,
    onLockToggle,
    onPidToggle,
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
                                    onLockToggle(hasLock);
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
                            <Typography variant='overline'>
                                {pid.on ? 'PID' : 'MANUAL'}
                            </Typography>
                        </Grid>
                        <Grid
                            size={2}
                            sx={{ display: 'flex', justifyContent: 'center' }}
                        >
                            <Box
                                sx={{
                                    width: '12px',
                                    height: '12px',
                                    backgroundColor: pid.on ? 'green' : 'grey',
                                    borderRadius: '50%',
                                }}
                            />
                        </Grid>
                        <Grid
                            size={4.5}
                            sx={{ display: 'flex', justifyContent: 'flex-end' }}
                        >
                            <Switch
                                checked={hasPid}
                                disabled={
                                    !(
                                        isPidButtonEnabled &&
                                        (
                                            (!pid.on && inUse && hasLock) ||
                                            hasPid
                                        )
                                    )
                                }
                                size='small'
                                onChange={() => {
                                    onPidToggle(hasPid);
                                }}
                            />
                        </Grid>
                    </Grid>
                </Grid>
            ) : (
                <Skeleton variant='rounded' width={140} height={75} />
            )}
        </Stack>
    );
};

export default ChannelHeader;
