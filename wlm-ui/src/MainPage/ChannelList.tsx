import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { channelListActions, selectChannelList } from '../store/slices/channel/channel';
import './ChannelList.css';

const ChannelListTable = () => {
    const channelListState = useSelector(selectChannelList);
    useEffect(() => {
        localStorage.setItem('channel.channelList', JSON.stringify(channelListState.channels));
    }, [channelListState]);

    const dispatch = useDispatch();

    const onClickUse = (channel: number) => () => {
        dispatch(channelListActions.toggleUse({ channel: channel }));
    };

    return (
        <section className='channel-list'>
            {channelListState.channels.map((chinfo) => {
                const channel = chinfo.channel.channel;
                return (
                    <article className='channel-panel' key={channel}>
                        <div>
                            <b>CH{channel} </b>
                            {chinfo.channel.name}
                            <button onClick={onClickUse(channel)}>
                                {chinfo.inUse ? 'In use' : 'Use'}
                            </button>
                        </div>
                    </article>
                );
            })}
        </section>
    );
};

export default ChannelListTable;
