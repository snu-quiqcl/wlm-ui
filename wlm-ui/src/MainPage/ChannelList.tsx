import { useSelector } from "react-redux"
import { selectChannelList } from "../store/slices/channel/channel"

export default function ChannelListTable() {
    const channelListState = useSelector(selectChannelList);
    const onClickUse = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
        console.log(`channel use clicked: ${event}`)
    };
    return (
        <table>
            <thead><tr>
                <th>Use</th>
                <th>Channel</th>
                <th>Name</th>
            </tr></thead>
            <tbody>{channelListState.channels.map((channel) => {
                return (
                    <tr key={channel.channel.channel}>
                        <td><button
                            onClick={onClickUse}
                        >{channel.inUse ? 'O' : 'X'}</button></td>
                        <td>{channel.channel.channel}</td>
                        <td>{channel.channel.name}</td>
                    </tr>
                )
            })}</tbody>
        </table>
    )
};