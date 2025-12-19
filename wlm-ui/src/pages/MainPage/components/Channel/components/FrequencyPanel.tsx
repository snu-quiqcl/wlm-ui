import React from 'react';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import Grid from '@mui/material/Grid2';
import IconButton from '@mui/material/IconButton';
import Slider from '@mui/material/Slider';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import MuiCard from '@mui/material/Card';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { ResponsiveLine } from '@nivo/line';

const Card = MuiCard;

type Props = {
    isOpen: boolean;
    onToggle: () => void;
    latestMeasurementText: string;
    shouldUpdatePlot: boolean;
    onShouldUpdatePlotChange: (value: boolean) => void;
    chartData: { x: Date, y: number | null }[];
    timeWindow: number[];
    isTimeSliderEnabled: boolean;
    timeSliderRange: number[];
    timeSliderMarks: { value: number, label: string }[];
    onTimeSliderChange: (event: Event, value: number | number[], activeThumb: number) => void;
};

const FrequencyPanel = ({
    isOpen,
    onToggle,
    latestMeasurementText,
    shouldUpdatePlot,
    onShouldUpdatePlotChange,
    chartData,
    timeWindow,
    isTimeSliderEnabled,
    timeSliderRange,
    timeSliderMarks,
    onTimeSliderChange,
}: Props) => {
    return (
        <Stack>
            <Stack
                direction='row'
                sx={{ justifyContent: 'space-between', alignItems: 'center' }}
            >
                <Typography variant='subtitle2'>
                    Frequency
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
                <Stack spacing={1} sx={{ alignItems: 'center' }}>
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
                                onChange={() => onShouldUpdatePlotChange(!shouldUpdatePlot)}
                            />
                        </Stack>
                    </Stack>
                    <Box sx={{ width: '90%', height: '300px' }}>
                        <ResponsiveLine
                            data={[
                                {
                                    id: 'measurement',
                                    data: chartData,
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
                                <Card sx={{ width: '160px', padding: 1 }}>
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
                    </Box>
                    <Slider
                        size='small'
                        value={timeWindow}
                        min={timeSliderRange[0]}
                        max={timeSliderRange[1]}
                        marks={timeSliderMarks}
                        valueLabelDisplay='off'
                        disableSwap
                        onChange={onTimeSliderChange}
                        sx={{
                            display: isTimeSliderEnabled ? 'block' : 'none',
                            width: '80%',
                        }}
                    />
                </Stack>
            </Collapse>
        </Stack>
    );
};

export default FrequencyPanel;
