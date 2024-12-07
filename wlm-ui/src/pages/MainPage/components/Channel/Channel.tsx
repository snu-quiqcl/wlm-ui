import React, { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { Line } from '@nivo/line';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid2';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import MuiCard from '@mui/material/Card';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import { styled } from '@mui/material/styles';

import { AppDispatch } from '../../../../store';
import {
    channelListActions, OperationType, SettingType, MeasurementType, LockType, ChannelInfo,
    postInUse, postSetting, tryLock, releaseLock,
} from '../../../../store/slices/channel/channel';
import './Channel.scss';

const TIME_RANGE = 30 * 1000;

const Card = styled(MuiCard)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    padding: theme.spacing(2),
    gap: theme.spacing(2),
    borderRadius: theme.spacing(1),
}));

const Channel = (props: ChannelInfo) => {
    const [requestersText, setRequestersText] = useState<string>('');
    const [isInUseButtonEnabled, setIsInUseButtonEnabled] = useState<boolean>(true);
    const [lockText, setLockText] = useState<string>('');
    const [isLockButtonEnabled, setIsLockButtonEnabled] = useState<boolean>(true);
    const [isFrequencyOpen, setIsFrequencyOpen] = useState<boolean>(false);
    const [latestMeasurementText, setLatestMeasurementText] = useState<string>('');
    const [shouldUpdatePlot, setShouldUpdatePlot] = useState<boolean>(true);
    const [recentMeasurements, setRecentMeasurements] = useState<
    { x: Date, y: number | null }[]>([]);
    const [timeWindow, setTimeWindow] = useState<{ min: Date, max: Date }>(
        { min: new Date(Date.now() - TIME_RANGE), max: new Date() });
    const [isSettingOpen, setIsSettingOpen] = useState<boolean>(false);
    const canUpdateSettings = !props.lock.locked || (props.hasLock && isLockButtonEnabled);
    const measurementsRef = useRef(props.measurements);
    const dispatch = useDispatch<AppDispatch>();

    useEffect(() => {
        const channel = props.channel.channel;
        const socket = new WebSocket(`${process.env.REACT_APP_WEBSOCKET_URL}/setting/${channel}/`);

        socket.onmessage = event => {
            const data = JSON.parse(event.data) as Partial<SettingType>;
            dispatch(channelListActions.fetchSetting(
                { channel: channel, ...data }));
        };

        return () => socket.close();
    }, [dispatch, props.channel.channel]);

    useEffect(() => {
        const channel = props.channel.channel;
        const socket = new WebSocket(`${process.env.REACT_APP_WEBSOCKET_URL}/operation/${channel}/`);

        socket.onmessage = event => {
            const data = JSON.parse(event.data) as OperationType;
            dispatch(channelListActions.fetchOperation(
                { channel: channel, operation: data }));
        };

        return () => socket.close();
    }, [dispatch, props.channel.channel]);

    useEffect(() => {
        const channel = props.channel.channel;
        const socket = new WebSocket(
            `${process.env.REACT_APP_WEBSOCKET_URL}/measurement/${channel}/`);

        socket.onmessage = event => {
            const data = JSON.parse(event.data) as MeasurementType | MeasurementType[];
            dispatch(channelListActions.fetchMeasurements(
                { channel: channel, measurements: data }));
        };

        return () => socket.close();
    }, [dispatch, props.channel.channel]);

    useEffect(() => {
        const channel = props.channel.channel;
        const socket = new WebSocket(`${process.env.REACT_APP_WEBSOCKET_URL}/lock/${channel}/`);

        socket.onmessage = event => {
            const data = JSON.parse(event.data) as LockType;
            dispatch(channelListActions.fetchLock(
                { channel: channel, lock: data }));
        };

        return () => socket.close();
    }, [dispatch, props.channel.channel]);

    useEffect(() => {
        const channel = props.channel.channel;

        const interval = setInterval(() => {
            dispatch(channelListActions.removeOldMeasurements({ channel: channel }));
        }, 10 * 60 * 1000);

        return () => {
            clearInterval(interval);
            dispatch(channelListActions.removeAllMeasurements({ channel: channel }));
        };
    }, [dispatch, props.channel.channel]);

    useEffect(() => {
        measurementsRef.current = props.measurements;
        const latestMeasurement = props.measurements.at(-1);

        if (latestMeasurement !== undefined) {
            const { frequency, error } = latestMeasurement;
            if (frequency !== null) {
                setLatestMeasurementText(`${(frequency / 1e12).toFixed(6)} THz`);
            } else if (error === 'over') {
                setLatestMeasurementText('Overexposed');
            } else if (error === 'under') {
                setLatestMeasurementText('Underexposed');
            } else {
                setLatestMeasurementText('Error')
            }
        } else{
            setLatestMeasurementText('');
        }
    }, [props.measurements]);

    useEffect(() => {
        let interval: NodeJS.Timer | undefined;

        if (shouldUpdatePlot) {
            interval = setInterval(() => {
                const now = new Date();
                const cutoffTime = new Date(now.getTime() - TIME_RANGE);

                setRecentMeasurements(measurementsRef.current.filter(measurement => (
                    new Date(measurement.measuredAt) > cutoffTime
                )).map(measurement => ({
                    x: new Date(measurement.measuredAt),
                    y: measurement.frequency,
                })));

                setTimeWindow({ min: cutoffTime, max: now });
            }, 100);
        } else {
            clearInterval(interval);
        }

        return () => clearInterval(interval);
    }, [shouldUpdatePlot]);

    useEffect(() => {
        setShouldUpdatePlot(props.inUse);
        setIsInUseButtonEnabled(true);
    }, [props.inUse]);

    useEffect(() => {
        setIsLockButtonEnabled(true);
    }, [props.hasLock]);

    useEffect(() => {
        if (props.lock.locked) {
            setLockText(`${props.lock.owner} holds the lock.`);
        } else {
            setLockText('No one holds the lock.');
        }
    }, [props.lock]);

    useEffect(() => {
        const requesters = props.operation.requesters;

        if (requesters.length === 0) {
            setRequestersText('No users are watching.');
        } else if (requesters.length === 1) {
            setRequestersText(`${requesters[0]} is watching.`);
        } else if (requesters.length === 2) {
            setRequestersText(`${requesters[0]} and ${requesters[1]} are watching.`);
        } else {
            setRequestersText(
                `${requesters.slice(0, -1).join(', ')}, and ${requesters.at(-1)} are watching.`);
        }
    }, [props.operation.requesters]);

    const onClickSetInUse = (inUse: boolean) => {
        dispatch(postInUse({ channel: props.channel.channel, inUse: inUse }));
    };

    const getExposure = () => {
        const exposureText = document.getElementById('exposure') as HTMLInputElement;
        if (!exposureText.value) {
            return;
        }
        return Number(exposureText.value) / 1e3;
    };

    const getPeriod = () => {
        const periodText = document.getElementById('period') as HTMLInputElement;
        if (!periodText.value) {
            return;
        }
        return Number(periodText.value);
    };

    const handleSetting = (setting: Partial<SettingType>) => {
        if (setting.exposure || setting.period) {
            dispatch(postSetting({ channel: props.channel.channel, ...setting }));
        }
    };

    const onClickTryLock = () => {
        dispatch(tryLock({ channel: props.channel.channel }));
    };

    const onClickReleaseLock = () => {
        dispatch(releaseLock({ channel: props.channel.channel }));
    };

    return (
        <Card
            variant='outlined'
            sx={theme => ({
                gap: 1,
                [theme.breakpoints.up('sm')]: {
                    maxWidth: isFrequencyOpen ? '500px' : '300px',
                },
            })}
        >
            <Stack
                direction='row'
                sx={{ justifyContent: 'space-between', alignItems: 'center' }}
            >
                <Stack
                    sx={{ alignItems: 'flex-start' }}
                >
                    <Typography
                        component='h1'
                        variant='h6'
                        sx={{ fontWeight: 'bold' }}
                    >
                        Channel {props.channel.channel}
                    </Typography>
                    <Typography component='h2' variant='subtitle1'>
                        {props.channel.name}
                    </Typography>
                </Stack>
                <Grid
                    container
                    sx={{ width: 140 }}
                >
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
                                    {props.operation.on ? 'on' : 'off'}
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
                                    backgroundColor: props.operation.on ? 'green' : 'grey',
                                    borderRadius: '50%',
                                }}
                            />
                        </Grid>
                        <Grid
                            size={4.5}
                            sx={{ display: 'flex', justifyContent: 'flex-end' }}
                        >
                            <Switch
                                checked={props.inUse}
                                disabled={!isInUseButtonEnabled}
                                size='small'
                                onChange={() => {
                                    setIsInUseButtonEnabled(false);
                                    onClickSetInUse(props.inUse);
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
                                    {props.hasLock ? 'LOCKED' : 'OPEN'}
                                </Typography>
                            </Tooltip>
                        </Grid>
                        <Grid
                            size={2}
                            sx={{ display: 'flex', justifyContent: 'center' }}
                        >
                            {props.hasLock ? (
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
                                checked={props.hasLock}
                                disabled={!isLockButtonEnabled}
                                size='small'
                                onChange={() => {
                                    setIsLockButtonEnabled(false);
                                    if (props.hasLock) {
                                        onClickReleaseLock();
                                    } else {
                                        onClickTryLock();
                                    }
                                }}
                            />
                        </Grid>
                    </Grid>
                </Grid>
            </Stack>
            <Stack>
                <Stack
                    direction='row'
                    sx={{ justifyContent: 'space-between', alignItems: 'center' }}
                >
                    <Typography variant='subtitle2'>
                        Frequency
                    </Typography>
                    <IconButton
                        onClick={() => setIsFrequencyOpen(!isFrequencyOpen)}
                        sx={{
                            transform: isFrequencyOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 0.3s ease',
                        }}
                    >
                        <ExpandMoreIcon />
                    </IconButton>
                </Stack>
                <Collapse
                    in={isFrequencyOpen}
                    sx={{ marginTop: 1 }}
                >
                    <Stack
                        direction='row'
                        sx={{ justifyContent: 'flex-start', alignItems: 'center', gap: 2 }}
                    >
                        <Typography
                            variant='subtitle1'
                            sx={{ width: '130px', textAlign: 'left' }}
                        >
                            {latestMeasurementText}
                        </Typography>
                        <Stack
                            direction='row'
                            sx={{ alignItems: 'center', gap: 1 }}
                        >
                            <Typography variant='body2'>
                                Live
                            </Typography>
                            <Switch
                                checked={shouldUpdatePlot}
                                size='small'
                                onChange={() => setShouldUpdatePlot(!shouldUpdatePlot)}
                            />
                        </Stack>
                    </Stack>
                    <Line
                        data={[
                            {
                                id: 'measurement',
                                data: recentMeasurements,
                            },
                        ]}
                        xScale={{
                            type: 'time',
                            precision: 'millisecond',
                            min: timeWindow.min,
                            max: timeWindow.max,
                        }}
                        xFormat='time:%M:%S.%L'
                        yScale={{
                            type: 'linear',
                            min: 'auto',
                            max: 'auto',
                            nice: true,
                        }}
                        yFormat={value => `${(Number(value) / 1e12).toFixed(6)} THz`}
                        width={450}
                        height={300}
                        margin={{
                            top: 30,
                            right: 30,
                            bottom: 30,
                            left: 80,
                        }}
                        curve='monotoneX'
                        lineWidth={2}
                        enablePoints
                        pointSize={8}
                        pointColor={{ from: 'color' }}
                        pointBorderWidth={1}
                        pointBorderColor='#fff'
                        enableGridX
                        gridXValues='every 5 seconds'
                        enableGridY
                        axisBottom={{
                            format: '%M:%S',
                            tickValues: 'every 5 seconds',
                        }}
                        axisLeft={{
                            format: value => (Number(value) / 1e12).toFixed(6).split('.')[1],
                            legend: 'Frequency (MHz)',
                            legendOffset: -70,
                            legendPosition: 'middle',
                        }}
                        isInteractive
                        enableSlices='x'
                        enableCrosshair
                        animate={false}
                    />
                </Collapse>
            </Stack>
            <Stack>
                <Stack
                    direction='row'
                    sx={{ justifyContent: 'space-between', alignItems: 'center' }}
                >
                    <Typography variant='subtitle2'>
                        Settings
                    </Typography>
                    <IconButton
                        onClick={() => setIsSettingOpen(!isSettingOpen)}
                        sx={{
                            transform: isSettingOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 0.3s ease',
                        }}
                    >
                        <ExpandMoreIcon />
                    </IconButton>
                </Stack>
                <Collapse
                    in={isSettingOpen}
                    sx={{ marginTop: 1 }}
                >
                    <Stack
                        sx={{ gap: 1 }}
                    >
                        <Stack
                            direction='row'
                            sx={{ justifyContent: 'center', alignItems: 'center', gap: 4 }}
                        >
                            <Stack
                                direction='row'
                                sx={{ alignItems: 'center', gap: 1 }}
                            >
                                <Typography
                                    variant='subtitle2'
                                    sx={{ fontWeight: 'bold' }}
                                >
                                    Exp. time
                                </Typography>
                                <Typography variant='body2'>
                                    {props.setting.exposure * 1e3} ms
                                </Typography>
                            </Stack>
                            <Stack
                                direction='row'
                                sx={{ alignItems: 'center', gap: 1 }}
                            >
                                <Typography
                                    variant='subtitle2'
                                    sx={{ fontWeight: 'bold' }}
                                >
                                    Period
                                </Typography>
                                <Typography variant='body2'>
                                    {props.setting.period} s
                                </Typography>
                            </Stack>
                        </Stack>
                        <Stack
                            direction='row'
                            sx={{
                                justifyContent: 'space-between',
                                alignItems: 'flex-end',
                                gap: 2,
                                pointerEvents: canUpdateSettings ? 'auto' : 'none',
                                opacity: canUpdateSettings ? 1 : 0.5,
                            }}
                        >
                            <Box
                                component='form'
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleSetting({ exposure: getExposure() });
                                }}
                                sx={{ width: '40%' }}
                            >
                                <FormControl>
                                    <TextField
                                        id='exposure'
                                        label='Exposure'
                                        placeholder='100'
                                        variant='standard'
                                        size='small'
                                        autoFocus
                                        fullWidth
                                        slotProps={{
                                            htmlInput: { style: { fontSize: '0.8rem' } },
                                            inputLabel: { style: { fontSize: '0.8rem' } },
                                            input: {
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <Typography sx={{ fontSize: '0.8rem' }}>
                                                            ms
                                                        </Typography>
                                                    </InputAdornment>
                                                ),
                                            },
                                        }}
                                    />
                                </FormControl>
                            </Box>
                            <Box
                                component='form'
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleSetting({ period: getPeriod() });
                                }}
                                sx={{ width: '40%' }}
                            >
                                <FormControl>
                                    <TextField
                                        id='period'
                                        label='Period'
                                        placeholder='1'
                                        variant='standard'
                                        size='small'
                                        autoFocus
                                        fullWidth
                                        slotProps={{
                                            htmlInput: { style: { fontSize: '0.8rem' } },
                                            inputLabel: { style: { fontSize: '0.8rem' } },
                                            input: {
                                                endAdornment:
                                                    <InputAdornment position="end">
                                                        <Typography sx={{ fontSize: '0.8rem' }}>
                                                            s
                                                        </Typography>
                                                    </InputAdornment>,
                                            },
                                        }}
                                    />
                                </FormControl>
                            </Box>
                            <Button
                                variant='contained'
                                size='small'
                                sx={{ fontSize: '0.8rem', marginBottom: 0.3, padding: 0 }}
                                onClick={() => {
                                    handleSetting({ exposure: getExposure(), period: getPeriod() });
                                }}
                            >
                                APPLY
                            </Button>
                        </Stack>
                    </Stack>
                </Collapse>
            </Stack>
        </Card>
    );
};

export default Channel;
