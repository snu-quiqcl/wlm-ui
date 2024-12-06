import React, { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { Line } from '@nivo/line';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import MuiCard from '@mui/material/Card';
import { styled } from '@mui/material/styles';

import { AppDispatch } from '../../../../store';
import {
    channelListActions, OperationType, SettingType, MeasurementType, LockType, ChannelInfo,
    postInUse, postExposure, postPeriod, tryLock, releaseLock,
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
    const [exposure, setExposure] = useState<number>(0);
    const [period, setPeriod] = useState<number>(0);
    const measurementsRef = useRef(props.measurements);
    const [recentMeasurements, setRecentMeasurements] = useState<
        { x: Date, y: number | null }[]>([]);
    const [timeWindow, setTimeWindow] = useState<{ min: Date, max: Date }>(
        { min: new Date(Date.now() - TIME_RANGE), max: new Date() });
    const latestMeasurement = props.measurements.at(-1);
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

    const onClickSetInUse = (inUse: boolean) => {
        dispatch(postInUse({ channel: props.channel.channel, inUse: inUse }));
    };

    const onClickSetExposure = (exposure: number) => {
        dispatch(postExposure({ channel: props.channel.channel, exposure: exposure }));
    };
    
    const onClickSetPeriod = (period: number) => {
        dispatch(postPeriod({ channel: props.channel.channel, period: period }));
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
            <span style={{ textAlign: 'left' }}>
                Requesters: {props.operation.requesters.join(', ')}
            </span>
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
            <div className='channel-attr-viewer-container'>
                <b>Exp. time</b>
                <span style={{ width: '60px', textAlign: 'right' }}>
                    {props.setting.exposure * 1e3} ms
                </span>
                <b>Period</b>
                <span style={{ width: '60px', textAlign: 'right' }}>
                    {props.setting.period} s
                </span>
            </div>
            <div className={`channel-attr-editor-container ${!canUpdateSettings && 'disabled'}`}>
                <b style={{ textAlign: 'left' }}>Exp. time</b>
                <input
                    type='number'
                    min={0}
                    step={10}
                    value={exposure * 1e3}
                    onChange={(e) => setExposure(Number(e.target.value) / 1e3)}
                    style={{ textAlign: 'right' }}
                />
                <span style={{ textAlign: 'left' }}>ms</span>
                <button onClick={() => onClickSetExposure(exposure)}>Set</button>
                <b style={{ textAlign: 'left' }}>Period</b>
                <input
                    type='number'
                    min={0}
                    step={0.1}
                    value={period}
                    onChange={(e) => setPeriod(Number(e.target.value))}
                    style={{ textAlign: 'right' }}
                />
                <span style={{ textAlign: 'left' }}>s</span>
                <button onClick={() => onClickSetPeriod(period)}>Set</button>
            </div>
        </Card>
    );
};

export default Channel;
