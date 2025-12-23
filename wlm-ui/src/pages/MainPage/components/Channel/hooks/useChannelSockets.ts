import { useEffect, useState, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../../../../store';
import {
    channelListActions,
    OperationType,
    SettingType,
    MeasurementType,
    LockType,
} from '../../../../../store/slices/channel/channel';

export const useChannelSockets = (channel: number, hasLock: boolean) => {
    const dispatch = useDispatch<AppDispatch>();
    const [isOperationSocketConnected, setIsOperationSocketConnected] = useState<boolean>(false);
    const [isLockSocketConnected, setIsLockSocketConnected] = useState<boolean>(false);
    const [isMeasurementSocketConnected, setIsMeasurementSocketConnected] = useState<boolean>(false);
    const [isSettingSocketConnected, setIsSettingSocketConnected] = useState<boolean>(false);
    const [isDacOutputSocketConnected, setIsDacOutputSocketConnected] = useState<boolean>(false);
    const [isDacControlSocketConnected, setIsDacControlSocketConnected] = useState<boolean>(false);
    const dacControlSocketRef = useRef<WebSocket | null>(null);

    const areAllSocketsConnected =
        isOperationSocketConnected &&
        isLockSocketConnected &&
        isMeasurementSocketConnected &&
        isSettingSocketConnected &&
        isDacOutputSocketConnected;

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
        const socket = new WebSocket(`/ws/pid_setting/dac_output/${channel}/`);

        socket.onopen = () => {
            setIsDacOutputSocketConnected(true);
        };

        socket.onmessage = event => {
            const data = JSON.parse(event.data) as { voltage: number };
            dispatch(channelListActions.fetchPidDacOutput({ channel: channel, voltage: data.voltage }));
        };

        socket.onclose = () => {
            setIsDacOutputSocketConnected(false);
        };

        return () => socket.close();
    }, [dispatch, channel]);

    useEffect(() => {
        if (!hasLock) {
            if (dacControlSocketRef.current) {
                dacControlSocketRef.current.close();
                dacControlSocketRef.current = null;
            }
            setIsDacControlSocketConnected(false);
            return;
        }

        const socket = new WebSocket(`/ws/pid_setting/dac_control/${channel}/`);
        dacControlSocketRef.current = socket;

        socket.onopen = () => {
            setIsDacControlSocketConnected(true);
        };

        socket.onerror = (error) => {
            console.error('DAC control WebSocket error:', error);
        };

        socket.onclose = () => {
            setIsDacControlSocketConnected(false);
        };

        return () => {
            socket.close();
            dacControlSocketRef.current = null;
        };
    }, [channel, hasLock]);

    const sendDacVoltage = (voltage: number) => {
        if (dacControlSocketRef.current?.readyState === WebSocket.OPEN) {
            dacControlSocketRef.current.send(JSON.stringify({
                action: 'voltage',
                voltage: voltage,
            }));
        }
    };

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
        isDacOutputSocketConnected,
        isDacControlSocketConnected,
        sendDacVoltage,
    };
};
