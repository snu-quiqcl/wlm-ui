import React, { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { Line } from '@nivo/line';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import MuiCard from '@mui/material/Card';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
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
    [theme.breakpoints.up('sm')]: {
        maxWidth: '450px',
    },
    padding: theme.spacing(2),
    gap: theme.spacing(2),
    borderRadius: theme.spacing(1),
}));

const Channel = (props: ChannelInfo) => {
    const [isInUseButtonEnabled, setIsInUseButtonEnabled] = useState<boolean>(true);
    const [shouldUpdatePlot, setShouldUpdatePlot] = useState<boolean>(true);
    const [isLockButtonEnabled, setIsLockButtonEnabled] = useState<boolean>(true);
    const canUpdateSettings = !props.lock.locked || (props.hasLock && isLockButtonEnabled);
    const [isSettingOpen, setIsSettingOpen] = useState<boolean>(false);
    const measurementsRef = useRef(props.measurements);
    const [recentMeasurements, setRecentMeasurements] = useState<
        { x: Date, y: number | null }[]>([]);
    const [timeWindow, setTimeWindow] = useState<{ min: Date, max: Date }>(
        { min: new Date(Date.now() - TIME_RANGE), max: new Date() });
    const latestMeasurement = props.measurements.at(-1);
    const [requestersText, setRequestersText] = useState<string>('');
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
        <Card variant='outlined'>
            <Stack
                direction='row'
                sx={{ justifyContent: 'space-between', alignItems: 'center' }}
            >
                <Stack
                    sx={{ alignItems: 'flex-start' }}
                >
                    <Typography component='h1' variant='h6'>
                        CH {props.channel.channel}
                    </Typography>
                    <Typography component='h2' variant='subtitle1'>
                        {props.channel.name}
                    </Typography>
                </Stack>
                <Stack
                    sx={{ alignItems: 'flex-end' }}
                >
                    <Tooltip title={requestersText} placement='top'>
                        <Stack
                            direction='row'
                            sx={{ alignItems: 'center', gap: 1, marginRight: 1 }}
                        >
                            <Typography variant='overline'>
                                {props.operation.on ? 'on' : 'off'}
                            </Typography>
                            <Box
                                sx={{
                                    width: 12,
                                    height: 12,
                                    backgroundColor: props.operation.on ? 'green' : 'grey',
                                    borderRadius: '50%',
                                }}
                            />
                        </Stack>
                    </Tooltip>
                    <Switch
                        checked={props.inUse}
                        disabled={!isInUseButtonEnabled}
                        size='small'
                        onChange={() => {
                            setIsInUseButtonEnabled(false);
                            onClickSetInUse(props.inUse);
                        }}
                    />
                </Stack>
            </Stack>
            <div style={{ display: props.inUse ? 'block' : 'none' }}>
                <button onClick={() => setShouldUpdatePlot(!shouldUpdatePlot)}>
                    {shouldUpdatePlot ? 'Stop' : 'Start'}
                </button>
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
                    width={500}
                    height={300}
                    margin={{
                        top: 30,
                        right: 50,
                        bottom: 30,
                        left: 100,
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
                <h1>
                    {latestMeasurement ? (
                        latestMeasurement.frequency ? (
                            `${(latestMeasurement.frequency / 1e12).toFixed(6)} THz`
                        ) : (
                            latestMeasurement.error
                        )
                    ) : (
                        'No measurement'
                    )}
                </h1>
            </div>
            <div className='channel-lock-container'>
                <span>{props.lock.locked ? `Locked by ${props.lock.owner}` : 'Open'}</span>
                <button
                    disabled={!isLockButtonEnabled}
                    onClick={() => {
                        setIsLockButtonEnabled(false);
                        if (props.hasLock) {
                            onClickReleaseLock();
                        } else {
                            onClickTryLock();
                        }
                    }}
                >
                    {props.hasLock ? 'Release' : 'Acquire'}
                </button>
            </div>
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
                sx={{ gap: 0 }}
            >
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
                <Collapse in={isSettingOpen}>
                    <Stack
                        direction='row'
                        sx={{ justifyContent: 'space-between', alignItems: 'flex-end', gap: 2 }}
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
                            variant='text'
                            size='small'
                            sx={{ fontSize: '0.8rem' }}
                            onClick={() => {
                                handleSetting({ exposure: getExposure(), period: getPeriod() });
                            }}
                        >
                            APPLY
                        </Button>
                    </Stack>
                </Collapse>
            </Stack>
        </Card>
    );
};

export default Channel;
