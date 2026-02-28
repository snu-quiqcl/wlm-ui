import React, { useState, useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { PidSettingType } from '../../../../../store/slices/channel/channel';

const DEBOUNCE_DELAY_MS = 2000;
const FREQUENCY_TO_UI = 1e-12;  // Redux (Hz) -> UI (THz)
const COEFFICIENT_TO_UI = 1e12;  // Redux (1) -> UI (1e-12)
const FREQUENCY_DECIMAL_PLACES = 6;
const COEFFICIENT_DECIMAL_PLACES = 0;

type Props = {
    isOpen: boolean;
    onToggle: () => void;
    setting: PidSettingType;
    canUpdateSettings: boolean;
    channel: number;
    onPidSettingChange: (setting: Partial<PidSettingType>) => void;
};

const PidSettingPanel = ({
    isOpen,
    onToggle,
    setting,
    canUpdateSettings,
    channel,
    onPidSettingChange,
}: Props) => {
    const [frequencyStep, setFrequencyStep] = useState<number>(0.00001);
    const [frequencyStepInputValue, setFrequencyStepInputValue] = useState<string>('0.00001');
    const [frequencyInputValue, setFrequencyInputValue] = useState<string>(
        (setting.targetFrequency * FREQUENCY_TO_UI).toFixed(FREQUENCY_DECIMAL_PLACES)
    );
    const [isFrequencyInteracting, setIsFrequencyInteracting] = useState<boolean>(false);
    const [isCoefficientsOpen, setIsCoefficientsOpen] = useState<boolean>(false);
    const [kpInputValue, setKpInputValue] = useState<string>(
        (setting.kp * COEFFICIENT_TO_UI).toFixed(COEFFICIENT_DECIMAL_PLACES)
    );
    const [kiInputValue, setKiInputValue] = useState<string>(
        (setting.ki * COEFFICIENT_TO_UI).toFixed(COEFFICIENT_DECIMAL_PLACES)
    );
    const [kdInputValue, setKdInputValue] = useState<string>(
        (setting.kd * COEFFICIENT_TO_UI).toFixed(COEFFICIENT_DECIMAL_PLACES)
    );
    const frequencyId = `channel-${channel}-frequency`;
    const frequencyStepId = `channel-${channel}-frequency-step`;
    const kpId = `channel-${channel}-kp`;
    const kiId = `channel-${channel}-ki`;
    const kdId = `channel-${channel}-kd`;
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (!isFrequencyInteracting) {
            setFrequencyInputValue(
                (setting.targetFrequency * FREQUENCY_TO_UI).toFixed(FREQUENCY_DECIMAL_PLACES));
        }
    }, [setting.targetFrequency, isFrequencyInteracting]);

    useEffect(() => {
        setKpInputValue((setting.kp * COEFFICIENT_TO_UI).toFixed(COEFFICIENT_DECIMAL_PLACES));
    }, [setting.kp]);

    useEffect(() => {
        setKiInputValue((setting.ki * COEFFICIENT_TO_UI).toFixed(COEFFICIENT_DECIMAL_PLACES));
    }, [setting.ki]);

    useEffect(() => {
        setKdInputValue((setting.kd * COEFFICIENT_TO_UI).toFixed(COEFFICIENT_DECIMAL_PLACES));
    }, [setting.kd]);

    useEffect(() => {
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, []);

    const handleFrequencyChange = (frequencyInUi: number) => {
        const frequency = frequencyInUi / FREQUENCY_TO_UI;
        onPidSettingChange({ targetFrequency: frequency });
    };

    const handleFrequencyInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFrequencyInputValue(event.target.value);
    };

    const handleFrequencyInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'ArrowUp') {
            event.preventDefault();
            handleFrequencyArrowUp();
        } else if (event.key === 'ArrowDown') {
            event.preventDefault();
            handleFrequencyArrowDown();
        }
    };

    const handleFrequencyInputSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        const frequencyInUi = Number(frequencyInputValue);
        if (!isNaN(frequencyInUi)) {
            setIsFrequencyInteracting(true);
            handleFrequencyChange(frequencyInUi);
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
            debounceTimerRef.current = setTimeout(() => {
                setIsFrequencyInteracting(false);
            }, DEBOUNCE_DELAY_MS);
        } else {
            setFrequencyInputValue(
                (setting.targetFrequency * FREQUENCY_TO_UI).toFixed(FREQUENCY_DECIMAL_PLACES));
        }
    };

    const handleFrequencyStepChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFrequencyStepInputValue(event.target.value);
    };

    const handleFrequencyStepBlur = () => {
        const newFrequencyStep = Number(frequencyStepInputValue);
        if (!isNaN(newFrequencyStep) && newFrequencyStep > 0) {
            setFrequencyStep(newFrequencyStep);
            setFrequencyStepInputValue(newFrequencyStep.toString());
        } else {
            setFrequencyStepInputValue(frequencyStep.toString());
        }
    };

    const handleFrequencyStepSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        handleFrequencyStepBlur();
    };

    const handleFrequencyArrowUp = () => {
        const currentFrequencyInUi =
            Number(frequencyInputValue) || (setting.targetFrequency * FREQUENCY_TO_UI);
        const newFrequencyInUi = currentFrequencyInUi + frequencyStep;
        setIsFrequencyInteracting(true);
        setFrequencyInputValue(newFrequencyInUi.toFixed(FREQUENCY_DECIMAL_PLACES));
        handleFrequencyChange(newFrequencyInUi);
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }
        debounceTimerRef.current = setTimeout(() => {
            setIsFrequencyInteracting(false);
        }, DEBOUNCE_DELAY_MS);
    };

    const handleFrequencyArrowDown = () => {
        const currentFrequencyInUi =
            Number(frequencyInputValue) || (setting.targetFrequency * FREQUENCY_TO_UI);
        const newFrequencyInUi = currentFrequencyInUi - frequencyStep;
        setIsFrequencyInteracting(true);
        setFrequencyInputValue(newFrequencyInUi.toFixed(FREQUENCY_DECIMAL_PLACES));
        handleFrequencyChange(newFrequencyInUi);
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }
        debounceTimerRef.current = setTimeout(() => {
            setIsFrequencyInteracting(false);
        }, DEBOUNCE_DELAY_MS);
    };

    const getKp = () => {
        const kpText = document.getElementById(kpId) as HTMLInputElement;
        if (!kpText?.value) {
            return;
        }
        return Number(kpText.value);
    };

    const getKi = () => {
        const kiText = document.getElementById(kiId) as HTMLInputElement;
        if (!kiText?.value) {
            return;
        }
        return Number(kiText.value);
    };

    const getKd = () => {
        const kdText = document.getElementById(kdId) as HTMLInputElement;
        if (!kdText?.value) {
            return;
        }
        return Number(kdText.value);
    };

    const handleCoefficientsApply = () => {
        const kpInUi = getKp();
        const kiInUi = getKi();
        const kdInUi = getKd();
        const setting: {
            kp?: number;
            ki?: number;
            kd?: number;
        } = {};
        if (kpInUi !== undefined && !isNaN(kpInUi)) {
            setting.kp = kpInUi / COEFFICIENT_TO_UI;
        }
        if (kiInUi !== undefined && !isNaN(kiInUi)) {
            setting.ki = kiInUi / COEFFICIENT_TO_UI;
        }
        if (kdInUi !== undefined && !isNaN(kdInUi)) {
            setting.kd = kdInUi / COEFFICIENT_TO_UI;
        }
        if (Object.keys(setting).length > 0) {
            onPidSettingChange(setting);
        }
    };

    return (
        <Stack>
            <Stack
                direction='row'
                sx={{ justifyContent: 'space-between', alignItems: 'center' }}
            >
                <Typography variant='subtitle2'>
                    PID Setting
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
            {isOpen && (
                <Stack spacing={2}>
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
                                Target Frequency
                            </Typography>
                            <Typography variant='body2'>
                                {(setting.targetFrequency * FREQUENCY_TO_UI)
                                    .toFixed(FREQUENCY_DECIMAL_PLACES)} THz
                            </Typography>
                        </Stack>
                        <Stack
                            spacing={2}
                            sx={{
                                pointerEvents: canUpdateSettings ? 'auto' : 'none',
                                opacity: canUpdateSettings ? 1 : 0.5,
                            }}
                        >
                            <Stack
                                direction='row'
                                spacing={2}
                                sx={{ alignItems: 'flex-end' }}
                            >
                                <Box
                                    component='form'
                                    onSubmit={handleFrequencyInputSubmit}
                                    sx={{ flex: 1 }}
                                >
                                    <FormControl fullWidth>
                                        <TextField
                                            id={frequencyId}
                                            label='Target Frequency'
                                            placeholder={
                                                `0.${'0'.repeat(FREQUENCY_DECIMAL_PLACES)}`
                                            }
                                            variant='standard'
                                            size='small'
                                            value={frequencyInputValue}
                                            onChange={handleFrequencyInputChange}
                                            onKeyDown={handleFrequencyInputKeyDown}
                                            slotProps={{
                                                htmlInput: { style: { fontSize: '0.8rem' } },
                                                inputLabel: { style: { fontSize: '0.8rem' } },
                                                input: {
                                                    endAdornment: (
                                                        <InputAdornment position="end">
                                                            <Typography sx={{ fontSize: '0.8rem' }}>
                                                                THz
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
                                        onClick={handleFrequencyArrowUp}
                                        sx={{ border: '1px solid', borderColor: 'divider' }}
                                    >
                                        <AddIcon fontSize='small' />
                                    </IconButton>
                                    <IconButton
                                        size='small'
                                        onClick={handleFrequencyArrowDown}
                                        sx={{ border: '1px solid', borderColor: 'divider' }}
                                    >
                                        <RemoveIcon fontSize='small' />
                                    </IconButton>
                                </Stack>
                                <Box
                                    component='form'
                                    onSubmit={handleFrequencyStepSubmit}
                                    sx={{ width: '80px' }}
                                >
                                    <FormControl fullWidth>
                                        <TextField
                                            id={frequencyStepId}
                                            label='Step'
                                            variant='standard'
                                            size='small'
                                            value={frequencyStepInputValue}
                                            onChange={handleFrequencyStepChange}
                                            onBlur={handleFrequencyStepBlur}
                                            slotProps={{
                                                htmlInput: { style: { fontSize: '0.8rem' } },
                                                inputLabel: { style: { fontSize: '0.8rem' } },
                                                input: {
                                                    endAdornment: (
                                                        <InputAdornment position="end">
                                                            <Typography sx={{ fontSize: '0.8rem' }}>
                                                                THz
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
                    <Stack spacing={1}>
                        <Stack
                            direction='row'
                            sx={{ justifyContent: 'space-between', alignItems: 'center' }}
                        >
                            <Typography variant='subtitle2'>
                                PID Coefficients
                            </Typography>
                            <IconButton
                                onClick={() => setIsCoefficientsOpen(!isCoefficientsOpen)}
                                sx={{
                                    transform: isCoefficientsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                                    transition: 'transform 0.3s ease',
                                }}
                            >
                                <ExpandMoreIcon />
                            </IconButton>
                        </Stack>
                        {isCoefficientsOpen && (
                            <Stack spacing={2}>
                                <Stack
                                    direction='row'
                                    spacing={1}
                                    sx={{ justifyContent: 'center', alignItems: 'center' }}
                                >
                                    <Typography
                                        variant='subtitle2'
                                        sx={{ fontWeight: 'bold' }}
                                    >
                                        kp
                                    </Typography>
                                    <Typography variant='body2'>
                                        {(setting.kp * COEFFICIENT_TO_UI)
                                            .toFixed(COEFFICIENT_DECIMAL_PLACES)}
                                    </Typography>
                                    <Typography
                                        variant='subtitle2'
                                        sx={{ fontWeight: 'bold', ml: 2 }}
                                    >
                                        ki
                                    </Typography>
                                    <Typography variant='body2'>
                                        {(setting.ki * COEFFICIENT_TO_UI)
                                            .toFixed(COEFFICIENT_DECIMAL_PLACES)}
                                    </Typography>
                                    <Typography
                                        variant='subtitle2'
                                        sx={{ fontWeight: 'bold', ml: 2 }}
                                    >
                                        kd
                                    </Typography>
                                    <Typography variant='body2'>
                                        {(setting.kd * COEFFICIENT_TO_UI)
                                            .toFixed(COEFFICIENT_DECIMAL_PLACES)}
                                    </Typography>
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
                                            handleCoefficientsApply();
                                        }}
                                        sx={{ width: '30%' }}
                                    >
                                        <FormControl fullWidth>
                                            <TextField
                                                id={kpId}
                                                label='kp'
                                                placeholder={
                                                    `0.${'0'.repeat(COEFFICIENT_DECIMAL_PLACES)}`
                                                }
                                                variant='standard'
                                                size='small'
                                                value={kpInputValue}
                                                onChange={(e) => setKpInputValue(e.target.value)}
                                                slotProps={{
                                                    htmlInput: { style: { fontSize: '0.8rem' } },
                                                    inputLabel: { style: { fontSize: '0.8rem' } },
                                                }}
                                            />
                                        </FormControl>
                                    </Box>
                                    <Box
                                        component='form'
                                        onSubmit={(e) => {
                                            e.preventDefault();
                                            handleCoefficientsApply();
                                        }}
                                        sx={{ width: '30%' }}
                                    >
                                        <FormControl fullWidth>
                                            <TextField
                                                id={kiId}
                                                label='ki'
                                                placeholder={
                                                    `0.${'0'.repeat(COEFFICIENT_DECIMAL_PLACES)}`
                                                }
                                                variant='standard'
                                                size='small'
                                                value={kiInputValue}
                                                onChange={(e) => setKiInputValue(e.target.value)}
                                                slotProps={{
                                                    htmlInput: { style: { fontSize: '0.8rem' } },
                                                    inputLabel: { style: { fontSize: '0.8rem' } },
                                                }}
                                            />
                                        </FormControl>
                                    </Box>
                                    <Box
                                        component='form'
                                        onSubmit={(e) => {
                                            e.preventDefault();
                                            handleCoefficientsApply();
                                        }}
                                        sx={{ width: '30%' }}
                                    >
                                        <FormControl fullWidth>
                                            <TextField
                                                id={kdId}
                                                label='kd'
                                                placeholder={
                                                    `0.${'0'.repeat(COEFFICIENT_DECIMAL_PLACES)}`
                                                }
                                                variant='standard'
                                                size='small'
                                                value={kdInputValue}
                                                onChange={(e) => setKdInputValue(e.target.value)}
                                                slotProps={{
                                                    htmlInput: { style: { fontSize: '0.8rem' } },
                                                    inputLabel: { style: { fontSize: '0.8rem' } },
                                                }}
                                            />
                                        </FormControl>
                                    </Box>
                                    <Button
                                        variant='contained'
                                        size='small'
                                        sx={{ fontSize: '0.8rem', marginBottom: 0.3, padding: 0 }}
                                        onClick={handleCoefficientsApply}
                                    >
                                        apply
                                    </Button>
                                </Stack>
                            </Stack>
                        )}
                    </Stack>
                </Stack>
            )}
        </Stack>
    );
};

export default PidSettingPanel;
