import React, { useMemo } from 'react';
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
    latestFrequency: number | null;
    latestMeasurementText: string;
    targetFrequency: number | null;
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
    latestFrequency,
    latestMeasurementText,
    targetFrequency,
    shouldUpdatePlot,
    onShouldUpdatePlotChange,
    chartData,
    timeWindow,
    isTimeSliderEnabled,
    timeSliderRange,
    timeSliderMarks,
    onTimeSliderChange,
}: Props) => {
    const yScale = useMemo(() => {
        if (chartData.length === 0) {
            return {
                type: 'linear' as const,
                min: 'auto' as const,
                max: 'auto' as const,
                nice: true,
            };
        }

        const validData = chartData.filter(d => d.y !== null);
        if (validData.length === 0) {
            return {
                type: 'linear' as const,
                min: 'auto' as const,
                max: 'auto' as const,
                nice: true,
            };
        }

        const yValues = validData.map(d => d.y!);
        let minY = Math.min(...yValues);
        let maxY = Math.max(...yValues);

        if (targetFrequency !== null) {
            if (targetFrequency < minY) {
                minY = targetFrequency;
            } else if (targetFrequency > maxY) {
                maxY = targetFrequency;
            }
        }

        const range = maxY - minY;
        const padding = range * 0.1;
        minY -= padding;
        maxY += padding;

        return {
            type: 'linear' as const,
            min: minY,
            max: maxY,
            nice: true,
        };
    }, [chartData, targetFrequency]);

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
            <Stack
                direction='row'
                spacing={2}
                sx={{ justifyContent: 'flex-start', alignItems: 'center', marginTop: 1 }}
            >
                <Typography
                    variant='subtitle1'
                    sx={{ width: '130px', textAlign: 'left' }}
                >
                    {latestMeasurementText}
                </Typography>
                {latestFrequency !== null && targetFrequency !== null && (
                    <Typography variant='subtitle1' sx={{ color: 'text.secondary' }}>
                        Detuning: {((latestFrequency - targetFrequency) / 1e6).toFixed()} MHz
                    </Typography>
                )}
            </Stack>
            <Collapse in={isOpen} sx={{ marginTop: 1 }}>
                <Stack spacing={1} sx={{ alignItems: 'center' }}>
                    <Stack
                        direction='row'
                        spacing={1}
                        sx={{ justifyContent: 'flex-start', alignItems: 'center' }}
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
                            yScale={yScale}
                            yFormat={value => `${(Number(value) / 1e12).toFixed(6)} THz`}
                            margin={{
                                top: 10,
                                right: 80,
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
                            markers={targetFrequency !== null ? [
                                {
                                    axis: 'y',
                                    value: targetFrequency,
                                    lineStyle: { stroke: '#ff0000', strokeWidth: 2, strokeDasharray: '5 5' },
                                },
                            ] : []}
                            axisBottom={{
                                format: '%M:%S',
                            }}
                            axisLeft={{
                                format: value => (Number(value) / 1e12).toFixed(6).split('.')[1],
                                legend: 'Frequency (MHz)',
                                legendOffset: -70,
                                legendPosition: 'middle',
                            }}
                            axisRight={targetFrequency !== null ? {
                                format: value => {
                                    const delta = Number(value) - targetFrequency;
                                    return `${(delta / 1e6).toFixed()} MHz`;
                                },
                                legend: 'Delta (MHz)',
                                legendOffset: 70,
                                legendPosition: 'middle',
                            } : undefined}
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
