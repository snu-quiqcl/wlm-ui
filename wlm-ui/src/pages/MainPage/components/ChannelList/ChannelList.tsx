import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { AppDispatch } from '../../../../store';
import {
    fetchList, postInUse, postExposure, postPeriod, tryLock, releaseLock, selectChannelList,
} from '../../../../store/slices/channel/channel';
import Channel from '../Channel/Channel';
import './ChannelList.scss';

const ChannelList = () => {
    const channelListState = useSelector(selectChannelList);
    const dispatch = useDispatch<AppDispatch>();

    useEffect(() => {
        dispatch(fetchList());
    }, [dispatch]);

    const onClickRefreshChannelList = async () => {
        dispatch(fetchList());
    };

    const onClickSetInUse = (channel: number, inUse: boolean) => {
        dispatch(postInUse({ channel: channel, inUse: inUse }));
    };

    const onClickSetExposure = (channel: number, exposure: number) => {
        dispatch(postExposure({ channel: channel, exposure: exposure }));
    };
    
    const onClickSetPeriod = (channel: number, period: number) => {
        dispatch(postPeriod({ channel: channel, period: period }));
    };

    const onClickTryLock = (channel: number) => {
        dispatch(tryLock({ channel: channel }));
    };

    const onClickReleaseLock = (channel: number) => {
        dispatch(releaseLock({ channel: channel }));
    };

    return (
        <div>
            <button onClick={onClickRefreshChannelList}>Refresh</button>
            <section className='channel-container'>
                {channelListState.channels.map((info) => (
                    <article key={info.channel.channel}>
                        <Channel
                            {...info}
                            onClickSetInUse={(inUse: boolean) =>
                                onClickSetInUse(info.channel.channel, inUse)}
                            onClickSetExposure={(exposure: number) =>
                                onClickSetExposure(info.channel.channel, exposure)}
                            onClickSetPeriod={(period: number) =>
                                onClickSetPeriod(info.channel.channel, period)}
                            onClickTryLock={() => onClickTryLock(info.channel.channel)}
                            onClickReleaseLock={() => onClickReleaseLock(info.channel.channel)}
                        />
                    </article>
                ))}
            </section>
        </div>
    );
};

export default ChannelList;
