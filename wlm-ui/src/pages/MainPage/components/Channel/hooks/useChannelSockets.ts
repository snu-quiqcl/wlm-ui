import { useEffect, useState, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../../../../store';
import {
    channelListActions,
    OperationType,
    SettingType,
    PidType,
    PidSettingType,
    DacOutputType,
    MeasurementType,
    LockType,
} from '../../../../../store/slices/channel/channel';

export const useChannelSockets = (channel: number, hasLock: boolean, hasDacInfo: boolean) => {
    const dispatch = useDispatch<AppDispatch>();
    const [isOperationSocketConnected, setIsOperationSocketConnected] = useState<boolean>(false);
    const [isLockSocketConnected, setIsLockSocketConnected] = useState<boolean>(false);
    const [isPidOperationSocketConnected, setIsPidOperationSocketConnected] = useState<boolean>(false);
    const [isMeasurementSocketConnected, setIsMeasurementSocketConnected] = useState<boolean>(false);
    const [isSettingSocketConnected, setIsSettingSocketConnected] = useState<boolean>(false);
    const [isDacOutputSocketConnected, setIsDacOutputSocketConnected] = useState<boolean>(false);
    const [isDacControlSocketConnected, setIsDacControlSocketConnected] = useState<boolean>(false);
    const [isPidSettingSocketConnected, setIsPidSettingSocketConnected] = useState<boolean>(false);
    const dacControlSocketRef = useRef<WebSocket | null>(null);

    const areAllSocketsConnected =
        isOperationSocketConnected &&
        isLockSocketConnected &&
        isMeasurementSocketConnected &&
        isSettingSocketConnected &&
        (!hasDacInfo || (
            isPidOperationSocketConnected &&
            isDacOutputSocketConnected &&
            isPidSettingSocketConnected
        ));

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
        if (!hasDacInfo) {
            setIsPidOperationSocketConnected(false);
            return;
        }

        const socket = new WebSocket(`/ws/pid_operation/${channel}/`);

        socket.onopen = () => {
            setIsPidOperationSocketConnected(true);
        };

        socket.onmessage = event => {
            const data = JSON.parse(event.data) as Pick<PidType, 'on' | 'status'>;
            dispatch(channelListActions.fetchPidOperation({ channel: channel, ...data }));
        };

        socket.onclose = () => {
            setIsPidOperationSocketConnected(false);
        };

        return () => socket.close();
    }, [dispatch, channel, hasDacInfo]);

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
        if (!hasDacInfo) {
            setIsDacOutputSocketConnected(false);
            return;
        }

        const socket = new WebSocket(`/ws/pid_setting/dac_output/${channel}/`);

        socket.onopen = () => {
            setIsDacOutputSocketConnected(true);
        };

        socket.onmessage = event => {
            const data = JSON.parse(event.data) as Pick<DacOutputType, 'voltage'>;
            dispatch(channelListActions.fetchPidDacOutput({ channel: channel, ...data }));
        };

        socket.onclose = () => {
            setIsDacOutputSocketConnected(false);
        };

        return () => socket.close();
    }, [dispatch, channel, hasDacInfo]);

    useEffect(() => {
        if (!hasDacInfo) {
            setIsPidSettingSocketConnected(false);
            return;
        }

        const socket = new WebSocket(`/ws/pid_setting/${channel}/`);

        socket.onopen = () => {
            setIsPidSettingSocketConnected(true);
        };

        socket.onmessage = event => {
            const data = JSON.parse(event.data) as Partial<PidSettingType>;
            dispatch(channelListActions.fetchPidSetting({ channel: channel, ...data }));
        };

        socket.onclose = () => {
            setIsPidSettingSocketConnected(false);
        };

        return () => socket.close();
    }, [dispatch, channel, hasDacInfo]);

    useEffect(() => {
        if (!hasLock || !hasDacInfo) {
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
    }, [channel, hasLock, hasDacInfo]);

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
        isPidOperationSocketConnected,
        isMeasurementSocketConnected,
        isSettingSocketConnected,
        isDacOutputSocketConnected,
        isDacControlSocketConnected,
        sendDacVoltage,
        isPidSettingSocketConnected,
    };
};
