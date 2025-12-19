import React, { useState, useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Slider from '@mui/material/Slider';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { PidType } from '../../../../../store/slices/channel/channel';
import { useChannelSockets } from '../hooks/useChannelSockets';

const MIN_VOLTAGE = 0;
const MAX_VOLTAGE = 2.5;
const DEBOUNCE_DELAY_MS = 2000;

type Props = {
    isOpen: boolean;
    onToggle: () => void;
    pid: PidType;
    canUpdateSettings: boolean;
    channel: number;
};

const DacOutputPanel = ({
    isOpen,
    onToggle,
    pid,
    canUpdateSettings,
    channel,
}: Props) => {
    const [step, setStep] = useState<number>(0.01);
    const [stepInputValue, setStepInputValue] = useState<string>('0.01');
    const [sliderValue, setSliderValue] = useState<number>(pid.dacOutput.voltage);
    const [inputValue, setInputValue] = useState<string>(pid.dacOutput.voltage.toFixed(4));
    const [isUserInteracting, setIsUserInteracting] = useState<boolean>(false);
    const voltageId = `channel-${channel}-voltage`;
    const stepId = `channel-${channel}-step`;
    const { sendDacVoltage } = useChannelSockets(channel);
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (!isUserInteracting) {
            setSliderValue(pid.dacOutput.voltage);
            setInputValue(pid.dacOutput.voltage.toFixed(4));
        }
    }, [pid.dacOutput.voltage, isUserInteracting]);

    const handleVoltageChange = (voltage: number) => {
        sendDacVoltage(voltage);
    };

    const handleSliderChange = (_event: Event, newValue: number | number[]) => {
        const voltage = newValue as number;
        setIsUserInteracting(true);
        setSliderValue(voltage);
        setInputValue(voltage.toFixed(4));
        handleVoltageChange(voltage);
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }
        debounceTimerRef.current = setTimeout(() => {
            setIsUserInteracting(false);
        }, DEBOUNCE_DELAY_MS);
    };

    useEffect(() => {
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, []);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(event.target.value);
    };

    const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'ArrowUp') {
            event.preventDefault();
            handleArrowUp();
        } else if (event.key === 'ArrowDown') {
            event.preventDefault();
            handleArrowDown();
        }
    };

    const handleInputSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        const voltage = Number(inputValue);
        if (!isNaN(voltage) && voltage >= MIN_VOLTAGE && voltage <= MAX_VOLTAGE) {
            setIsUserInteracting(true);
            setSliderValue(voltage);
            handleVoltageChange(voltage);
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
            debounceTimerRef.current = setTimeout(() => {
                setIsUserInteracting(false);
            }, DEBOUNCE_DELAY_MS);
        } else {
            setInputValue(pid.dacOutput.voltage.toFixed(4));
        }
    };

    const handleStepChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setStepInputValue(event.target.value);
    };

    const handleStepBlur = () => {
        const newStep = Number(stepInputValue);
        if (!isNaN(newStep) && newStep > 0) {
            setStep(newStep);
            setStepInputValue(newStep.toString());
        } else {
            setStepInputValue(step.toString());
        }
    };

    const handleStepKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleStepBlur();
        }
    };

    const handleArrowUp = () => {
        const currentVoltage = Number(inputValue) || sliderValue;
        const newVoltage = Math.min(MAX_VOLTAGE, currentVoltage + step);
        setIsUserInteracting(true);
        setSliderValue(newVoltage);
        setInputValue(newVoltage.toFixed(4));
        handleVoltageChange(newVoltage);
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }
        debounceTimerRef.current = setTimeout(() => {
            setIsUserInteracting(false);
        }, DEBOUNCE_DELAY_MS);
    };

    const handleArrowDown = () => {
        const currentVoltage = Number(inputValue) || sliderValue;
        const newVoltage = Math.max(MIN_VOLTAGE, currentVoltage - step);
        setIsUserInteracting(true);
        setSliderValue(newVoltage);
        setInputValue(newVoltage.toFixed(4));
        handleVoltageChange(newVoltage);
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }
        debounceTimerRef.current = setTimeout(() => {
            setIsUserInteracting(false);
        }, DEBOUNCE_DELAY_MS);
    };

    return (
        <Stack>
            <Stack
                direction='row'
                sx={{ justifyContent: 'space-between', alignItems: 'center' }}
            >
                <Typography variant='subtitle2'>
                    DAC Output
                </Typography>
                <IconButton
                    onClick={onToggle}
                    sx={{
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.3s ease',
                    }}
                >
                    <ExpandMoreIcon />
                </IconButton>
            </Stack>
            <Collapse in={isOpen} sx={{ marginTop: 1 }}>
                <Stack spacing={1}>
                    <Stack
                        direction='row'
                        spacing={1}
                        sx={{ justifyContent: 'center', alignItems: 'center' }}
                    >
                        <Typography
                            variant='subtitle2'
                            sx={{ fontWeight: 'bold' }}
                        >
                            Voltage
                        </Typography>
                        <Typography variant='body2'>
                            {pid.dacOutput.voltage.toFixed(4)} V
                        </Typography>
                    </Stack>
                    <Stack
                        spacing={2}
                        sx={{
                            pointerEvents: canUpdateSettings ? 'auto' : 'none',
                            opacity: canUpdateSettings ? 1 : 0.5,
                        }}
                    >
                        <Box sx={{ px: 1 }}>
                            <Slider
                                size='small'
                                value={sliderValue}
                                min={MIN_VOLTAGE}
                                max={MAX_VOLTAGE}
                                step={0.01}
                                onChange={handleSliderChange}
                                valueLabelDisplay='auto'
                                valueLabelFormat={(value) => `${value.toFixed(4)} V`}
                                marks={[
                                    { value: MIN_VOLTAGE },
                                    { value: MAX_VOLTAGE },
                                ]}
                            />
                        </Box>
                        <Stack
                            direction='row'
                            spacing={2}
                            sx={{ alignItems: 'flex-end' }}
                        >
                            <Box
                                component='form'
                                onSubmit={handleInputSubmit}
                                sx={{ flex: 1 }}
                            >
                                <FormControl fullWidth>
                                    <TextField
                                        id={voltageId}
                                        label='Voltage'
                                        placeholder='0.0000'
                                        variant='standard'
                                        size='small'
                                        value={inputValue}
                                        onChange={handleInputChange}
                                        onKeyDown={handleInputKeyDown}
                                        slotProps={{
                                            htmlInput: { style: { fontSize: '0.8rem' } },
                                            inputLabel: { style: { fontSize: '0.8rem' } },
                                            input: {
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <Typography sx={{ fontSize: '0.8rem' }}>
                                                            V
                                                        </Typography>
                                                    </InputAdornment>
                                                ),
                                            },
                                        }}
                                    />
                                </FormControl>
                            </Box>
                            <Stack direction='row' spacing={0.5}>
                                <IconButton
                                    size='small'
                                    onClick={handleArrowUp}
                                    disabled={(Number(inputValue) || sliderValue) >= MAX_VOLTAGE}
                                    sx={{ border: '1px solid', borderColor: 'divider' }}
                                >
                                    <AddIcon fontSize='small' />
                                </IconButton>
                                <IconButton
                                    size='small'
                                    onClick={handleArrowDown}
                                    disabled={(Number(inputValue) || sliderValue) <= MIN_VOLTAGE}
                                    sx={{ border: '1px solid', borderColor: 'divider' }}
                                >
                                    <RemoveIcon fontSize='small' />
                                </IconButton>
                            </Stack>
                            <Box sx={{ width: '80px' }}>
                                <FormControl fullWidth>
                                    <TextField
                                        id={stepId}
                                        label='Step'
                                        variant='standard'
                                        size='small'
                                        value={stepInputValue}
                                        onChange={handleStepChange}
                                        onBlur={handleStepBlur}
                                        onKeyDown={handleStepKeyDown}
                                        slotProps={{
                                            htmlInput: { style: { fontSize: '0.8rem' } },
                                            inputLabel: { style: { fontSize: '0.8rem' } },
                                            input: {
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <Typography sx={{ fontSize: '0.8rem' }}>
                                                            V
                                                        </Typography>
                                                    </InputAdornment>
                                                ),
                                            },
                                        }}
                                    />
                                </FormControl>
                            </Box>
                        </Stack>
                    </Stack>
                </Stack>
            </Collapse>
        </Stack>
    );
};

export default DacOutputPanel;
