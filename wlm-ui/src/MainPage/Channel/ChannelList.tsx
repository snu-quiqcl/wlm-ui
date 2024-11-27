import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { AppDispatch } from '../../store';
import { channelListActions, fetchList, selectChannelList } from '../../store/slices/channel/channel';
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

    return (
        <div>
            <button onClick={onClickRefreshChannelList}>Refresh</button>
            <section className='channel-container'>
                {channelListState.channels.map((info) => (
                    <article key={info.channel.channel}>
                        <Channel
                            {...info}
                            onClickUse={() => onClickUse(info.channel.channel)}
                        />
                    </article>
                ))}
            </section>
        </div>
    );
};

export default ChannelList;
