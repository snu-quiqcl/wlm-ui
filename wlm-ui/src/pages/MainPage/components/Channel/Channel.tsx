import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import IconButton from '@mui/material/IconButton';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import MuiCard from '@mui/material/Card';
import DragHandleIcon from '@mui/icons-material/DragHandle';
import { styled } from '@mui/material/styles';
import { DraggableProvidedDragHandleProps } from '@hello-pangea/dnd';

import { AppDispatch } from '../../../../store';
import {
    ChannelInfo,
    SettingType,
    postInUse,
    postSetting,
    postPidOperation,
    tryLock,
    releaseLock,
} from '../../../../store/slices/channel/channel';
import { useChannelSockets } from './hooks/useChannelSockets';
import { useMeasurementWindow } from './hooks/useMeasurementWindow';
import ChannelHeader from './components/ChannelHeader';
import FrequencyPanel from './components/FrequencyPanel';
import SettingsPanel from './components/SettingsPanel';
import DacOutputPanel from './components/DacOutputPanel';

const Card = styled(MuiCard)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    height: 'fit-content',
    padding: theme.spacing(2),
    paddingBottom: theme.spacing(1),
    gap: theme.spacing(2),
    borderRadius: theme.spacing(1),
    boxShadow: 'hsla(220, 10%, 5%, 0.02) 0px 5px 10px 0px',
}));

type Props = ChannelInfo & { dragHandleProps: DraggableProvidedDragHandleProps | null };

const Channel = (props: Props) => {
    const [isInUseButtonEnabled, setIsInUseButtonEnabled] = useState<boolean>(true);
    const [isLockButtonEnabled, setIsLockButtonEnabled] = useState<boolean>(true);
    const [isPidButtonEnabled, setIsPidButtonEnabled] = useState<boolean>(true);
    const [isFrequencyOpen, setIsFrequencyOpen] = useState<boolean>(false);
    const [shouldUpdatePlot, setShouldUpdatePlot] = useState<boolean>(true);
    const [isSettingOpen, setIsSettingOpen] = useState<boolean>(false);
    const [isDacOutputOpen, setIsDacOutputOpen] = useState<boolean>(false);
    const [requestersText, setRequestersText] = useState<string>('');
    const [lockText, setLockText] = useState<string>('');

    const dispatch = useDispatch<AppDispatch>();
    const channel = props.channel.channel;

    const { areAllSocketsConnected, sendDacVoltage } = useChannelSockets(channel, props.hasLock);

    const {
        latestMeasurementText,
        chartData,
        timeWindow,
        isTimeSliderEnabled,
        timeSliderRange,
        timeSliderMarks,
        handleTimeSlider,
    } = useMeasurementWindow(props.measurements, shouldUpdatePlot);

    const canUpdateSettings = props.hasLock && isLockButtonEnabled;
    const canControlDac = canUpdateSettings && !props.hasPid && isPidButtonEnabled;

    useEffect(() => {
        const requesters = props.operation.requesters;

        if (requesters.length === 0) {
            setRequestersText('No users are watching.');
        } else if (requesters.length === 1) {
            setRequestersText(`${requesters[0]} is watching.`);
        } else if (requesters.length === 2) {
            setRequestersText(`${requesters[0]} and ${requesters[1]} are watching.`);
        } else {
            setRequestersText(
                `${requesters.slice(0, -1).join(', ')}, and ${requesters.at(-1)} are watching.`);
        }
    }, [props.operation.requesters]);

    useEffect(() => {
        setIsInUseButtonEnabled(true);
        setIsFrequencyOpen(props.inUse);
        setShouldUpdatePlot(props.inUse);
    }, [props.inUse]);

    useEffect(() => {
        if (props.lock.locked) {
            setLockText(`${props.lock.owner} holds the lock.`);
        } else {
            setLockText('No one holds the lock.');
        }
    }, [props.lock]);

    useEffect(() => {
        setIsLockButtonEnabled(true);
    }, [props.hasLock]);

    useEffect(() => {
        setIsPidButtonEnabled(true);
    }, [props.hasPid]);

    const onClickSetInUse = (inUse: boolean) => {
        setIsInUseButtonEnabled(false);
        dispatch(postInUse({ channel: channel, inUse: inUse }));
    };

    const onClickTryLock = () => {
        dispatch(tryLock({ channel: channel }));
    };

    const onClickReleaseLock = () => {
        dispatch(releaseLock({ channel: channel }));
    };

    const handleSetting = (setting: Partial<SettingType>) => {
        if (setting.exposure || setting.period) {
            dispatch(postSetting({ channel: channel, ...setting }));
        }
    };

    const handleLockToggle = (hasLock: boolean) => {
        setIsLockButtonEnabled(false);
        if (hasLock) {
            onClickReleaseLock();
        } else {
            onClickTryLock();
        }
    };

    const handlePidToggle = (hasPid: boolean) => {
        setIsPidButtonEnabled(false);
        dispatch(postPidOperation({ channel: channel, hasPid: hasPid }));
    };

    return (
        <Card
            variant='outlined'
            sx={theme => ({
                gap: 1,
                width: isFrequencyOpen ? '500px' : '300px',
                [theme.breakpoints.down('sm')]: {
                    width: '100%',
                },
            })}
        >
            <ChannelHeader
                channel={channel}
                channelName={props.channel.name}
                operation={props.operation}
                lock={props.lock}
                pid={props.pid}
                inUse={props.inUse}
                hasLock={props.hasLock}
                hasPid={props.hasPid}
                isInUseButtonEnabled={isInUseButtonEnabled}
                isLockButtonEnabled={isLockButtonEnabled}
                isPidButtonEnabled={isPidButtonEnabled}
                areAllSocketsConnected={areAllSocketsConnected}
                requestersText={requestersText}
                lockText={lockText}
                onInUseChange={onClickSetInUse}
                onLockToggle={handleLockToggle}
                onPidToggle={handlePidToggle}
            />
            {areAllSocketsConnected ? (
                <FrequencyPanel
                    isOpen={isFrequencyOpen}
                    onToggle={() => setIsFrequencyOpen(!isFrequencyOpen)}
                    latestMeasurementText={latestMeasurementText}
                    shouldUpdatePlot={shouldUpdatePlot}
                    onShouldUpdatePlotChange={setShouldUpdatePlot}
                    chartData={chartData}
                    timeWindow={timeWindow}
                    isTimeSliderEnabled={isTimeSliderEnabled}
                    timeSliderRange={timeSliderRange}
                    timeSliderMarks={timeSliderMarks}
                    onTimeSliderChange={handleTimeSlider}
                />
            ) : (
                <Skeleton variant='rounded' height={50} />
            )}
            {areAllSocketsConnected ? (
                <SettingsPanel
                    isOpen={isSettingOpen}
                    onToggle={() => setIsSettingOpen(!isSettingOpen)}
                    setting={props.setting}
                    canUpdateSettings={canUpdateSettings}
                    channel={channel}
                    onSettingChange={handleSetting}
                />
            ) : (
                <Skeleton variant='rounded' height={50} />
            )}
            {areAllSocketsConnected ? (
                <DacOutputPanel
                    isOpen={isDacOutputOpen}
                    onToggle={() => setIsDacOutputOpen(!isDacOutputOpen)}
                    pid={props.pid}
                    canControlDac={canControlDac}
                    channel={channel}
                    sendVoltage={sendDacVoltage}
                />
            ) : (
                <Skeleton variant='rounded' height={50} />
            )}
            <Stack
                direction='row'
                sx={{ justifyContent: 'center', alignItems: 'center' }}
            >
                <IconButton
                    size='small'
                    {...props.dragHandleProps}
                >
                    <DragHandleIcon fontSize='small' />
                </IconButton>
            </Stack>
        </Card>
    );
};

export default Channel;
