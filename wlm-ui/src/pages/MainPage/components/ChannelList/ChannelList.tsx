import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { AppDispatch } from '../../../../store';
import { fetchList, selectChannelList } from '../../../../store/slices/channel/channel';
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

    return (
        <div>
            <button onClick={onClickRefreshChannelList}>Refresh</button>
            <section className='channel-container'>
                {channelListState.channels.map((info) => (
                    <article key={info.channel.channel}>
                        <Channel {...info} />
                    </article>
                ))}
            </section>
        </div>
    );
};

export default ChannelList;
