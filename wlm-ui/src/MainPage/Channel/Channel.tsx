import React from 'react';

import { ChannelInfo } from '../../store/slices/channel/channel';
import './Channel.scss'

interface IProps extends ChannelInfo {
    onClickUse: () => void;
}

const Channel = (props: IProps) => {
    return (
        <div className='channel-item'>
            <div className='channel-title'>
                <b>CH {props.channel.channel}</b>
                <span>{props.channel.name}</span>
                <button onClick={props.onClickUse} style={{ width: '60px' }}>{props.inUse ? 'In use' : 'Use'}</button>
            </div>
            <div className='channel-attr-container'>
                <b>Exp. time</b>
                <input type='number' min={0} step={10} style={{ textAlign: 'right' }} />
                <span>ms</span>
                <button>Set</button>
            </div>
        </div>
    );
};

export default Channel;
