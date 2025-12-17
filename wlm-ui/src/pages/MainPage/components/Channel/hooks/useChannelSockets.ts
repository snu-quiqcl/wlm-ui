import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../../../../store';
import {
    channelListActions,
    OperationType,
    SettingType,
    MeasurementType,
    LockType,
} from '../../../../../store/slices/channel/channel';

export const useChannelSockets = (channel: number) => {
    const dispatch = useDispatch<AppDispatch>();
    const [isOperationSocketConnected, setIsOperationSocketConnected] = useState<boolean>(false);
    const [isLockSocketConnected, setIsLockSocketConnected] = useState<boolean>(false);
    const [isMeasurementSocketConnected, setIsMeasurementSocketConnected] = useState<boolean>(false);
    const [isSettingSocketConnected, setIsSettingSocketConnected] = useState<boolean>(false);

    const areAllSocketsConnected =
        isOperationSocketConnected &&
        isLockSocketConnected &&
        isMeasurementSocketConnected &&
        isSettingSocketConnected;

    useEffect(() => {
        const socket = new WebSocket(`/ws/operation/${channel}/`);

        socket.onopen = () => {
            setIsOperationSocketConnected(true);
        };

        socket.onmessage = event => {
            const data = JSON.parse(event.data) as OperationType;
            dispatch(channelListActions.fetchOperation({ channel: channel, operation: data }));
        };

        socket.onclose = () => {
            setIsOperationSocketConnected(false);
        };

        return () => socket.close();
    }, [dispatch, channel]);

    useEffect(() => {
        const socket = new WebSocket(`/ws/lock/${channel}/`);

        socket.onopen = () => {
            setIsLockSocketConnected(true);
        };

        socket.onmessage = event => {
            const data = JSON.parse(event.data) as LockType;
            dispatch(channelListActions.fetchLock({ channel: channel, lock: data }));
        };

        socket.onclose = () => {
            setIsLockSocketConnected(false);
        };

        return () => socket.close();
    }, [dispatch, channel]);

    useEffect(() => {
        const socket = new WebSocket(`/ws/measurement/${channel}/`);

        socket.onopen = () => {
            setIsMeasurementSocketConnected(true);
        };

        socket.onmessage = event => {
            const data = JSON.parse(event.data) as MeasurementType | MeasurementType[];
            dispatch(channelListActions.fetchMeasurements({ channel: channel, measurements: data }));
        };

        socket.onclose = () => {
            setIsMeasurementSocketConnected(false);
        };

        return () => socket.close();
    }, [dispatch, channel]);

    useEffect(() => {
        const socket = new WebSocket(`/ws/setting/${channel}/`);

        socket.onopen = () => {
            setIsSettingSocketConnected(true);
        };

        socket.onmessage = event => {
            const data = JSON.parse(event.data) as Partial<SettingType>;
            dispatch(channelListActions.fetchSetting({ channel: channel, ...data }));
        };

        socket.onclose = () => {
            setIsSettingSocketConnected(false);
        };

        return () => socket.close();
    }, [dispatch, channel]);

    useEffect(() => {
        const intervalId = setInterval(() => {
            dispatch(channelListActions.removeOldMeasurements({ channel: channel }));
        }, 10 * 60 * 1000);

        return () => {
            clearInterval(intervalId);
            dispatch(channelListActions.removeAllMeasurements({ channel: channel }));
        };
    }, [dispatch, channel]);

    return {
        areAllSocketsConnected,
        isOperationSocketConnected,
        isLockSocketConnected,
        isMeasurementSocketConnected,
        isSettingSocketConnected,
    };
};
