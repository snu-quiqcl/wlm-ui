import React, { useState } from 'react';

import { ChannelInfo } from '../../store/slices/channel/channel';
import './Channel.scss'

interface IProps extends ChannelInfo {
    onClickUse: () => void;
    onClickSetExposure: (exposure: number) => void;
}

const Channel = (props: IProps) => {
    const [exposure, setExposure] = useState<number>(0);

    return (
        <div className='channel-item'>
            <div className='channel-title'>
                <b>CH {props.channel.channel}</b>
                <span>{props.channel.name}</span>
                <button onClick={props.onClickUse} style={{ width: '60px' }}>{props.inUse ? 'In use' : 'Use'}</button>
            </div>
            <div className='channel-attr-container'>
                <b style={{ textAlign: 'left' }}>Exp. time</b>
                <input
                    type='number'
                    min={0}
                    step={10}
                    value={exposure * 1e3}
                    onChange={(e) => setExposure(Number(e.target.value) / 1e3)}
                    style={{ textAlign: 'right' }}
                />
                <span>ms</span>
                <button onClick={() => props.onClickSetExposure(exposure)}>Set</button>
                <b style={{ textAlign: 'left' }}>Period</b>
                <input type='number' min={0} step={0.1} style={{ textAlign: 'right' }} />
                <span>s</span>
                <button>Set</button>
            </div>
        </div>
    );
};

export default Channel;
