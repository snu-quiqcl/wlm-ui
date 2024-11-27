import React from 'react';

import { ChannelInfo } from '../../store/slices/channel/channel';

interface IProps extends ChannelInfo {
    onClickUse: () => void;
}

const Channel = (props: IProps) => {
    return (
        <div>
            <button onClick={props.onClickUse}>{props.inUse ? 'In use' : 'Use'}</button>
        </div>
    );
};

export default Channel;
