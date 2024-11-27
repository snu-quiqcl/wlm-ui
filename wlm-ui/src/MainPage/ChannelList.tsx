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
                            <span>{chinfo.channel.name} </span>
                            <button onClick={onClickUse(channel)}>
                                {chinfo.inUse ? 'In use' : 'Use'}
                            </button>
                        </div>
                        <table><tbody>
                            <tr>
                                <th>Exp. time</th>
                                <td><input type='number' min='0' step='1' style={{textAlign: 'right'}} required /></td>
                                <td align='left'>ms</td>
                                <td><input type='submit' value='Set' /></td>
                            </tr>
                            <tr>
                                <th>Period</th>
                                <td><input type='number' min='0' step='0.1' style={{textAlign: 'right'}} required /></td>
                                <td align='left'>s</td>
                                <td><input type='submit' value='Set' /></td>
                            </tr>
                        </tbody></table>
                    </article>
                );
            })}
        </section>
    );
};

export default ChannelListTable;
