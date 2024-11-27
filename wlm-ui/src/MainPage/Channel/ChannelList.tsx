import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { AppDispatch } from '../../store';
import {
    channelListActions, fetchList, postExposure, postPeriod, selectChannelList,
} from '../../store/slices/channel/channel';
import Channel from './Channel';
import './ChannelList.scss';

const ChannelList = () => {
    const channelListState = useSelector(selectChannelList);

    useEffect(() => {
        localStorage.setItem('channel.channelList', JSON.stringify(channelListState.channels));
    }, [channelListState]);

    const dispatch = useDispatch<AppDispatch>();

    const onClickRefreshChannelList = async () => {
        dispatch(fetchList());
    };

    const onClickUse = (channel: number) => {
        dispatch(channelListActions.toggleUse({ channel: channel }));
    };

    const onClickSetExposure = (channel: number, exposure: number) => {
        dispatch(postExposure({ channel: channel, exposure: exposure }));
    };
    
    const onClickSetPeriod = (channel: number, period: number) => {
        dispatch(postPeriod({ channel: channel, period: period }));
    };

    return (
        <div>
            <button onClick={onClickRefreshChannelList}>Refresh</button>
            <section className='channel-container'>
                {channelListState.channels.map((info) => (
                    <article key={info.channel.channel}>
                        <Channel
                            {...info}
                            onClickUse={() => onClickUse(info.channel.channel)}
                            onClickSetExposure={(exposure: number) =>
                                onClickSetExposure(info.channel.channel, exposure)}
                            onClickSetPeriod={(period: number) =>
                                onClickSetPeriod(info.channel.channel, period)}
                        />
                    </article>
                ))}
            </section>
        </div>
    );
};

export default ChannelList;
