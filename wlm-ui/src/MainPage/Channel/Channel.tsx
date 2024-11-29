import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { AppDispatch } from '../../store';
import {
    channelListActions, SettingType, MeasurementType, ChannelInfo
} from '../../store/slices/channel/channel';
import './Channel.scss';

interface IProps extends ChannelInfo {
    onClickSetInUse: (inUse: boolean) => void;
    onClickSetExposure: (exposure: number) => void;
    onClickSetPeriod: (period: number) => void;
};

const Channel = (props: IProps) => {
    const [isInUseButtonEnabled, setIsInUseButtonEnabled] = useState<boolean>(true);
    const [exposure, setExposure] = useState<number>(0);
    const [period, setPeriod] = useState<number>(0);
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
            const data = JSON.parse(event.data) as MeasurementType;
            dispatch(channelListActions.fetchMeasurement(
                { channel: channel, measurement: data }));
        };

        return () => socket.close();
    }, [dispatch, props.channel.channel]);

    useEffect(() => {
        const channel = props.channel.channel;

        const interval = setInterval(() => {
            dispatch(channelListActions.removeOldMeasurements({ channel: channel }));
        }, 10 * 60 * 1000);

        return () => clearInterval(interval);
    }, [dispatch, props.channel.channel]);

    useEffect(() => {
        setIsInUseButtonEnabled(true);
    }, [props.inUse]);

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
