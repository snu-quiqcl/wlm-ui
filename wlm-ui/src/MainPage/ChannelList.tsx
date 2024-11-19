import { useDispatch, useSelector } from "react-redux"
import { channelListActions, selectChannelList } from "../store/slices/channel/channel"

export default function ChannelListTable() {
    const channelListState = useSelector(selectChannelList);
    const dispatch = useDispatch();
    const onClickUse = (channel: number) => {
        return (_event: React.MouseEvent<HTMLElement, MouseEvent>) => {
            dispatch(channelListActions.toggleUse({ channel: channel }));
        }
    };
    return (
        <table>
            <thead><tr>
                <th>Use</th>
                <th>Channel</th>
                <th>Name</th>
            </tr></thead>
            <tbody>{channelListState.channels.map((chinfo) => {
                const channel = chinfo.channel.channel;
                return (
                    <tr key={channel}>
                        <td><button onClick={onClickUse(channel)}>
                            {chinfo.inUse ? 'O' : 'X'}
                        </button></td>
                        <td>{channel}</td>
                        <td>{chinfo.channel.name}</td>
                    </tr>
                )
            })}</tbody>
        </table>
    )
};