import React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { SettingType } from '../../../../../store/slices/channel/channel';

type Props = {
    isOpen: boolean;
    onToggle: () => void;
    setting: SettingType;
    canUpdateSettings: boolean;
    channel: number;
    onSettingChange: (setting: Partial<SettingType>) => void;
};

const SettingsPanel = ({
    isOpen,
    onToggle,
    setting,
    canUpdateSettings,
    channel,
    onSettingChange,
}: Props) => {
    const exposureId = `channel-${channel}-exposure`;
    const periodId = `channel-${channel}-period`;

    const getExposure = () => {
        const exposureText = document.getElementById(exposureId) as HTMLInputElement;
        if (!exposureText?.value) {
            return;
        }
        return Number(exposureText.value) / 1e3;
    };

    const getPeriod = () => {
        const periodText = document.getElementById(periodId) as HTMLInputElement;
        if (!periodText?.value) {
            return;
        }
        return Number(periodText.value);
    };

    const handleSetting = (setting: Partial<SettingType>) => {
        if (setting.exposure || setting.period) {
            onSettingChange(setting);
        }
    };

    return (
        <Stack>
            <Stack
                direction='row'
                sx={{ justifyContent: 'space-between', alignItems: 'center' }}
            >
                <Typography variant='subtitle2'>
                    Settings
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
                                {setting.exposure * 1e3} ms
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
                                {setting.period} s
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
                                    id={exposureId}
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
                                    id={periodId}
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
                            apply
                        </Button>
                    </Stack>
                </Stack>
            </Collapse>
        </Stack>
    );
};

export default SettingsPanel;
