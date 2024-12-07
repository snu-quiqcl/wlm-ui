import React, { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { Line } from '@nivo/line';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid2';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Slider from '@mui/material/Slider';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import MuiCard from '@mui/material/Card';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import { styled } from '@mui/material/styles';

import { AppDispatch } from '../../../../store';
import {
    channelListActions, OperationType, SettingType, MeasurementType, LockType, ChannelInfo,
    postInUse, postSetting, tryLock, releaseLock,
} from '../../../../store/slices/channel/channel';

const TIME_RANGE = 30 * 1000;

const Card = styled(MuiCard)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    padding: theme.spacing(2),
    gap: theme.spacing(2),
    borderRadius: theme.spacing(1),
}));

const Channel = (props: ChannelInfo) => {
    const [requestersText, setRequestersText] = useState<string>('');
    const [isInUseButtonEnabled, setIsInUseButtonEnabled] = useState<boolean>(true);
    const [lockText, setLockText] = useState<string>('');
    const [isLockButtonEnabled, setIsLockButtonEnabled] = useState<boolean>(true);
    const [isFrequencyOpen, setIsFrequencyOpen] = useState<boolean>(false);
    const [latestMeasurementText, setLatestMeasurementText] = useState<string>('');
    const [shouldUpdatePlot, setShouldUpdatePlot] = useState<boolean>(true);
    const [measurements, setMeasurements] = useState<{ x: Date, y: number | null }[]>([]);
    const [timeWindow, setTimeWindow] = useState<number[]>([Date.now() - TIME_RANGE, Date.now()]);
    const [isTimeSliderEnabled, setIsTimeSliderEnabled] = useState<boolean>(false);
    const [timeSliderRange, setTimeSliderRange] = useState<number[]>([]);
    const [timeSliderMarks, setTimeSliderMarks] = useState<{ value: number, label: string }[]>([]);
    const [isSettingOpen, setIsSettingOpen] = useState<boolean>(false);
    const canUpdateSettings = !props.lock.locked || (props.hasLock && isLockButtonEnabled);
    const measurementsRef = useRef(props.measurements);
    const dispatch = useDispatch<AppDispatch>();

    useEffect(() => {
        const channel = props.channel.channel;
        const socket = new WebSocket(`${process.env.REACT_APP_WEBSOCKET_URL}/operation/${channel}/`);

        socket.onmessage = event => {
            const data = JSON.parse(event.data) as OperationType;
            dispatch(channelListActions.fetchOperation(
                { channel: channel, operation: data }));
        };

        return () => socket.close();
    }, [dispatch, props.channel.channel]);

    useEffect(() => {
        const channel = props.channel.channel;
        const socket = new WebSocket(`${process.env.REACT_APP_WEBSOCKET_URL}/lock/${channel}/`);

        socket.onmessage = event => {
            const data = JSON.parse(event.data) as LockType;
            dispatch(channelListActions.fetchLock(
                { channel: channel, lock: data }));
        };

        return () => socket.close();
    }, [dispatch, props.channel.channel]);

    useEffect(() => {
        const channel = props.channel.channel;
        const socket = new WebSocket(
            `${process.env.REACT_APP_WEBSOCKET_URL}/measurement/${channel}/`);

        socket.onmessage = event => {
            const data = JSON.parse(event.data) as MeasurementType | MeasurementType[];
            dispatch(channelListActions.fetchMeasurements(
                { channel: channel, measurements: data }));
        };

        return () => socket.close();
    }, [dispatch, props.channel.channel]);

    useEffect(() => {
        const channel = props.channel.channel;
        const socket = new WebSocket(`${process.env.REACT_APP_WEBSOCKET_URL}/setting/${channel}/`);

        socket.onmessage = event => {
            const data = JSON.parse(event.data) as Partial<SettingType>;
            dispatch(channelListActions.fetchSetting(
                { channel: channel, ...data }));
        };

        return () => socket.close();
    }, [dispatch, props.channel.channel]);

    useEffect(() => {
        const channel = props.channel.channel;

        const interval = setInterval(() => {
            dispatch(channelListActions.removeOldMeasurements({ channel: channel }));
        }, 10 * 60 * 1000);

        return () => {
            clearInterval(interval);
            dispatch(channelListActions.removeAllMeasurements({ channel: channel }));
        };
    }, [dispatch, props.channel.channel]);

    useEffect(() => {
        measurementsRef.current = props.measurements;
        const latestMeasurement = props.measurements.at(-1);

        if (latestMeasurement !== undefined) {
            const { frequency, error } = latestMeasurement;
            if (frequency !== null) {
                setLatestMeasurementText(`${(frequency / 1e12).toFixed(6)} THz`);
            } else if (error === 'over') {
                setLatestMeasurementText('Overexposed');
            } else if (error === 'under') {
                setLatestMeasurementText('Underexposed');
            } else {
                setLatestMeasurementText('Error')
            }
        } else{
            setLatestMeasurementText('');
        }
    }, [props.measurements]);

    useEffect(() => {
        let interval: NodeJS.Timer | undefined;

        if (shouldUpdatePlot) {
            setIsTimeSliderEnabled(false);

            interval = setInterval(() => {
                const now = Date.now();
                const cutoffTime = new Date(now - TIME_RANGE).getTime();
                setTimeWindow([cutoffTime, now]);
            }, 100);
        } else {
            clearInterval(interval);

            if (measurementsRef.current.length) {
                const startTime = new Date(measurementsRef.current[0].measuredAt).getTime();
                const endTime = new Date(measurementsRef.current.at(-1)!.measuredAt).getTime();
                setIsTimeSliderEnabled(true);
                setTimeSliderRange([startTime, endTime]);
                const startTimeCeil = Math.ceil(startTime / TIME_RANGE) * TIME_RANGE;
                const endTimeFloor = Math.floor(endTime / TIME_RANGE) * TIME_RANGE;
                setTimeSliderMarks(Array.from(
                    { length: (endTimeFloor - startTimeCeil) / TIME_RANGE + 1 },
                    (_, i) => startTimeCeil + i * TIME_RANGE,
                ).map(t => {
                    if (t % (4 * TIME_RANGE)) {
                        return { value: t, label: '' };
                    } else {
                        return { value: t, label: `${new Date(t).getMinutes()}` };
                    }
                }));
            }
        }

        return () => clearInterval(interval);
    }, [shouldUpdatePlot]);

    useEffect(() => {
        setMeasurements(measurementsRef.current.filter(measurement => {
            const timestamp = new Date(measurement.measuredAt).getTime();
            return timeWindow[0] < timestamp && timestamp < timeWindow[1];
        }).map(measurement => ({
            x: new Date(measurement.measuredAt),
            y: measurement.frequency,
        })));
    }, [timeWindow]);

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

    const onClickSetInUse = (inUse: boolean) => {
        dispatch(postInUse({ channel: props.channel.channel, inUse: inUse }));
    };

    const onClickTryLock = () => {
        dispatch(tryLock({ channel: props.channel.channel }));
    };

    const onClickReleaseLock = () => {
        dispatch(releaseLock({ channel: props.channel.channel }));
    };

    const handleTimeSlider = (event: Event, value: number | number[], activeThumb: number) => {
        if (!Array.isArray(value)) {
            return;
        }
        
        if (value[1] - value[0] < TIME_RANGE) {
            if (activeThumb === 0) {
                const clamped = Math.min(value[0], timeSliderRange[1] - TIME_RANGE);
                setTimeWindow([clamped, clamped + TIME_RANGE]);
            } else {
                const clamped = Math.max(value[1], timeSliderRange[0] + TIME_RANGE);
                setTimeWindow([clamped - TIME_RANGE, clamped]);
            }
        } else {
            setTimeWindow(value);
        }
    };

    const getExposure = () => {
        const exposureText = document.getElementById('exposure') as HTMLInputElement;
        if (!exposureText.value) {
            return;
        }
        return Number(exposureText.value) / 1e3;
    };

    const getPeriod = () => {
        const periodText = document.getElementById('period') as HTMLInputElement;
        if (!periodText.value) {
            return;
        }
        return Number(periodText.value);
    };

    const handleSetting = (setting: Partial<SettingType>) => {
        if (setting.exposure || setting.period) {
            dispatch(postSetting({ channel: props.channel.channel, ...setting }));
        }
    };

    return (
        <Card
            variant='outlined'
            sx={theme => ({
                gap: 1,
                [theme.breakpoints.up('sm')]: {
                    maxWidth: isFrequencyOpen ? '500px' : '300px',
                },
            })}
        >
            <Stack
                direction='row'
                sx={{ justifyContent: 'space-between', alignItems: 'center' }}
            >
                <Stack
                    sx={{ alignItems: 'flex-start' }}
                >
                    <Typography
                        component='h1'
                        variant='h6'
                        sx={{ fontWeight: 'bold' }}
                    >
                        Channel {props.channel.channel}
                    </Typography>
                    <Typography component='h2' variant='subtitle1'>
                        {props.channel.name}
                    </Typography>
                </Stack>
                <Grid
                    container
                    sx={{ width: 140 }}
                >
                    <Grid
                        container
                        size={12}
                        sx={{ display: 'flex', alignItems: 'center' }}
                    >
                        <Grid
                            size={5.5}
                            sx={{ display: 'flex', justifyContent: 'flex-start' }}
                        >
                            <Tooltip title={requestersText} placement='top'>
                                <Typography variant='overline'>
                                    {props.operation.on ? 'on' : 'off'}
                                </Typography>
                            </Tooltip>
                        </Grid>
                        <Grid
                            size={2}
                            sx={{ display: 'flex', justifyContent: 'center' }}
                        >
                            <Box
                                sx={{
                                    width: '12px',
                                    height: '12px',
                                    backgroundColor: props.operation.on ? 'green' : 'grey',
                                    borderRadius: '50%',
                                }}
                            />
                        </Grid>
                        <Grid
                            size={4.5}
                            sx={{ display: 'flex', justifyContent: 'flex-end' }}
                        >
                            <Switch
                                checked={props.inUse}
                                disabled={!isInUseButtonEnabled}
                                size='small'
                                onChange={() => {
                                    setIsInUseButtonEnabled(false);
                                    onClickSetInUse(props.inUse);
                                }}
                            />
                        </Grid>
                    </Grid>
                    <Grid
                        container
                        size={12}
                        sx={{ display: 'flex', alignItems: 'center' }}
                    >
                        <Grid
                            size={5.5}
                            sx={{ display: 'flex', justifyContent: 'flex-start' }}
                        >
                            <Tooltip title={lockText} placement='top'>
                                <Typography variant='overline'>
                                    {props.hasLock ? 'LOCKED' : 'OPEN'}
                                </Typography>
                            </Tooltip>
                        </Grid>
                        <Grid
                            size={2}
                            sx={{ display: 'flex', justifyContent: 'center' }}
                        >
                            {props.hasLock ? (
                                <LockIcon fontSize='small' />
                            ) : (
                                <LockOpenIcon fontSize='small' />
                            )}
                        </Grid>
                        <Grid
                            size={4.5}
                            sx={{ display: 'flex', justifyContent: 'flex-end' }}
                        >
                            <Switch
                                checked={props.hasLock}
                                disabled={!isLockButtonEnabled}
                                size='small'
                                onChange={() => {
                                    setIsLockButtonEnabled(false);
                                    if (props.hasLock) {
                                        onClickReleaseLock();
                                    } else {
                                        onClickTryLock();
                                    }
                                }}
                            />
                        </Grid>
                    </Grid>
                </Grid>
            </Stack>
            <Stack>
                <Stack
                    direction='row'
                    sx={{ justifyContent: 'space-between', alignItems: 'center' }}
                >
                    <Typography variant='subtitle2'>
                        Frequency
                    </Typography>
                    <IconButton
                        onClick={() => setIsFrequencyOpen(!isFrequencyOpen)}
                        sx={{
                            transform: isFrequencyOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 0.3s ease',
                        }}
                    >
                        <ExpandMoreIcon />
                    </IconButton>
                </Stack>
                <Collapse
                    in={isFrequencyOpen}
                    sx={{ marginTop: 1 }}
                >
                    <Stack
                        spacing={1}
                        sx={{ alignItems: 'center' }}
                    >
                        <Stack
                            direction='row'
                            spacing={2}
                            sx={{ justifyContent: 'flex-start', alignItems: 'center' }}
                        >
                            <Typography
                                variant='subtitle1'
                                sx={{ width: '130px', textAlign: 'left' }}
                            >
                                {latestMeasurementText}
                            </Typography>
                            <Stack
                                direction='row'
                                spacing={1}
                                sx={{ alignItems: 'center' }}
                            >
                                <Typography variant='body2'>
                                    Live
                                </Typography>
                                <Switch
                                    checked={shouldUpdatePlot}
                                    size='small'
                                    onChange={() => setShouldUpdatePlot(!shouldUpdatePlot)}
                                />
                            </Stack>
                        </Stack>
                        <Line
                            data={[
                                {
                                    id: 'measurement',
                                    data: measurements,
                                },
                            ]}
                            xScale={{
                                type: 'time',
                                precision: 'millisecond',
                                min: new Date(timeWindow[0]),
                                max: new Date(timeWindow[1]),
                            }}
                            xFormat='time:%M:%S.%L'
                            yScale={{
                                type: 'linear',
                                min: 'auto',
                                max: 'auto',
                                nice: true,
                            }}
                            yFormat={value => `${(Number(value) / 1e12).toFixed(6)} THz`}
                            width={450}
                            height={300}
                            margin={{
                                top: 10,
                                right: 30,
                                bottom: 30,
                                left: 80,
                            }}
                            curve='monotoneX'
                            lineWidth={2}
                            enablePoints
                            pointSize={6}
                            pointColor={{ from: 'color' }}
                            pointBorderWidth={1}
                            pointBorderColor='#fff'
                            enableGridX
                            enableGridY
                            axisBottom={{
                                format: '%M:%S',
                            }}
                            axisLeft={{
                                format: value => (Number(value) / 1e12).toFixed(6).split('.')[1],
                                legend: 'Frequency (MHz)',
                                legendOffset: -70,
                                legendPosition: 'middle',
                            }}
                            isInteractive
                            enableSlices='x'
                            sliceTooltip={({ slice }) => (
                                <Card
                                    sx={{ width: '160px', padding: 1 }}
                                >
                                    <Grid container>
                                        <Grid
                                            container
                                            size={12}
                                            sx={{ alignItems: 'center' }}
                                        >
                                            <Grid
                                                size={3.5}
                                                sx={{
                                                    display: 'flex',
                                                    justifyContent: 'center'
                                                }}
                                            >
                                                <Typography
                                                    variant='caption'
                                                    sx={{ fontWeight: 'bold' }}
                                                >
                                                    Time
                                                </Typography>
                                            </Grid>
                                            <Grid 
                                                size={8.5}
                                                sx={{
                                                    display: 'flex',
                                                    justifyContent: 'flex-start'
                                                }}
                                            >
                                                <Typography variant='caption'>
                                                    {slice.points[0].data.xFormatted}
                                                </Typography>
                                            </Grid>
                                        </Grid>
                                        <Grid
                                            container
                                            size={12}
                                            sx={{ alignItems: 'center' }}
                                        >
                                            <Grid
                                                size={3.5}
                                                sx={{
                                                    display: 'flex',
                                                    justifyContent: 'center'
                                                }}
                                            >
                                                <Typography
                                                    variant='caption'
                                                    sx={{ fontWeight: 'bold' }}
                                                >
                                                    Freq
                                                </Typography>
                                            </Grid>
                                            <Grid 
                                                size={8.5}
                                                sx={{
                                                    display: 'flex',
                                                    justifyContent: 'flex-start'
                                                }}
                                            >
                                                <Typography variant='caption'>
                                                    {slice.points[0].data.yFormatted}
                                                </Typography>
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                </Card>
                            )}
                            enableCrosshair
                            animate={false}
                        />
                        <Slider
                            size='small'
                            value={timeWindow}
                            min={timeSliderRange[0]}
                            max={timeSliderRange[1]}
                            marks={timeSliderMarks}
                            valueLabelDisplay='off'
                            disableSwap
                            onChange={handleTimeSlider}
                            sx={{
                                display: isTimeSliderEnabled ? 'block' : 'none',
                                width: '80%',
                            }}
                        />
                    </Stack>
                </Collapse>
            </Stack>
            <Stack>
                <Stack
                    direction='row'
                    sx={{ justifyContent: 'space-between', alignItems: 'center' }}
                >
                    <Typography variant='subtitle2'>
                        Settings
                    </Typography>
                    <IconButton
                        onClick={() => setIsSettingOpen(!isSettingOpen)}
                        sx={{
                            transform: isSettingOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 0.3s ease',
                        }}
                    >
                        <ExpandMoreIcon />
                    </IconButton>
                </Stack>
                <Collapse
                    in={isSettingOpen}
                    sx={{ marginTop: 1 }}
                >
                    <Stack
                        spacing={1}
                    >
                        <Stack
                            direction='row'
                            spacing={4}
                            sx={{ justifyContent: 'center', alignItems: 'center' }}
                        >
                            <Stack
                                direction='row'
                                spacing={1}
                                sx={{ alignItems: 'center' }}
                            >
                                <Typography
                                    variant='subtitle2'
                                    sx={{ fontWeight: 'bold' }}
                                >
                                    Exp. time
                                </Typography>
                                <Typography variant='body2'>
                                    {props.setting.exposure * 1e3} ms
                                </Typography>
                            </Stack>
                            <Stack
                                direction='row'
                                spacing={1}
                                sx={{ alignItems: 'center' }}
                            >
                                <Typography
                                    variant='subtitle2'
                                    sx={{ fontWeight: 'bold' }}
                                >
                                    Period
                                </Typography>
                                <Typography variant='body2'>
                                    {props.setting.period} s
                                </Typography>
                            </Stack>
                        </Stack>
                        <Stack
                            direction='row'
                            spacing={2}
                            sx={{
                                justifyContent: 'space-between',
                                alignItems: 'flex-end',
                                pointerEvents: canUpdateSettings ? 'auto' : 'none',
                                opacity: canUpdateSettings ? 1 : 0.5,
                            }}
                        >
                            <Box
                                component='form'
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleSetting({ exposure: getExposure() });
                                }}
                                sx={{ width: '40%' }}
                            >
                                <FormControl>
                                    <TextField
                                        id='exposure'
                                        label='Exposure'
                                        placeholder='100'
                                        variant='standard'
                                        size='small'
                                        autoFocus
                                        fullWidth
                                        slotProps={{
                                            htmlInput: { style: { fontSize: '0.8rem' } },
                                            inputLabel: { style: { fontSize: '0.8rem' } },
                                            input: {
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <Typography sx={{ fontSize: '0.8rem' }}>
                                                            ms
                                                        </Typography>
                                                    </InputAdornment>
                                                ),
                                            },
                                        }}
                                    />
                                </FormControl>
                            </Box>
                            <Box
                                component='form'
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleSetting({ period: getPeriod() });
                                }}
                                sx={{ width: '40%' }}
                            >
                                <FormControl>
                                    <TextField
                                        id='period'
                                        label='Period'
                                        placeholder='1'
                                        variant='standard'
                                        size='small'
                                        autoFocus
                                        fullWidth
                                        slotProps={{
                                            htmlInput: { style: { fontSize: '0.8rem' } },
                                            inputLabel: { style: { fontSize: '0.8rem' } },
                                            input: {
                                                endAdornment:
                                                    <InputAdornment position="end">
                                                        <Typography sx={{ fontSize: '0.8rem' }}>
                                                            s
                                                        </Typography>
                                                    </InputAdornment>,
                                            },
                                        }}
                                    />
                                </FormControl>
                            </Box>
                            <Button
                                variant='contained'
                                size='small'
                                sx={{ fontSize: '0.8rem', marginBottom: 0.3, padding: 0 }}
                                onClick={() => {
                                    handleSetting({ exposure: getExposure(), period: getPeriod() });
                                }}
                            >
                                APPLY
                            </Button>
                        </Stack>
                    </Stack>
                </Collapse>
            </Stack>
        </Card>
    );
};

export default Channel;
