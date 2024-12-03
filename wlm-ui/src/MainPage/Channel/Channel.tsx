import React, { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { Line } from '@nivo/line';

import { AppDispatch } from '../../store';
import {
    channelListActions, SettingType, MeasurementType, LockType, ChannelInfo
} from '../../store/slices/channel/channel';
import './Channel.scss';

const TIME_RANGE = 30 * 1000;

interface IProps extends ChannelInfo {
    onClickSetInUse: (inUse: boolean) => void;
    onClickSetExposure: (exposure: number) => void;
    onClickSetPeriod: (period: number) => void;
    onClickTryLock: () => void;
    onClickReleaseLock: () => void;
};

const Channel = (props: IProps) => {
    const [isInUseButtonEnabled, setIsInUseButtonEnabled] = useState<boolean>(true);
    const [shouldUpdatePlot, setShouldUpdatePlot] = useState<boolean>(true);
    const [isLockButtonEnabled, setIsLockButtonEnabled] = useState<boolean>(true);
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

    return (
        <div className='channel-item'>
            <div className='channel-title'>
                <b>CH {props.channel.channel}</b>
                <span>{props.channel.name}</span>
                <button
                    disabled={!isInUseButtonEnabled}
                    onClick={() => {
                        setIsInUseButtonEnabled(false);
                        props.onClickSetInUse(props.inUse);
                    }}
                    style={{ width: '60px' }}
                >
                    {props.inUse ? 'In use' : 'Use'}
                </button>
            </div>
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
                            props.onClickReleaseLock();
                        } else {
                            props.onClickTryLock();
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
            <div className={'channel-attr-editor-container'}>
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
                <button onClick={() => props.onClickSetExposure(exposure)}>Set</button>
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
                <button onClick={() => props.onClickSetPeriod(period)}>Set</button>
            </div>
        </div>
    );
};

export default Channel;
