import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../../../../store';
import { channelListActions } from '../../../../../store/slices/channel/channel';

/**
 * Keeps the focused channel in the store up to date.
 */
export const useFocusSocket = () => {
    const dispatch = useDispatch<AppDispatch>();

    useEffect(() => {
        const socket = new WebSocket('/ws/focus/');

        socket.onmessage = event => {
            const data = JSON.parse(event.data) as { channel: number | null };
            dispatch(channelListActions.fetchFocus({ channel: data.channel }));
        };

        return () => socket.close();
    }, [dispatch]);
};
