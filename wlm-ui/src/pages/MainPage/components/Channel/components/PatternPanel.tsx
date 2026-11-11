import React, { useMemo } from 'react';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { ResponsiveLine } from '@nivo/line';

import { PatternType } from '../hooks/usePatternSocket';

// Number of pixel buckets drawn; each bucket keeps its minimum and maximum so that peaks survive.
const MAX_BUCKETS = 512;

const toChartData = (pattern: number[]): { x: number, y: number }[] => {
    if (pattern.length <= 2 * MAX_BUCKETS) {
        return pattern.map((y, x) => ({ x, y }));
    }

    const bucketSize = pattern.length / MAX_BUCKETS;
    const data: { x: number, y: number }[] = [];
    for (let bucket = 0; bucket < MAX_BUCKETS; bucket++) {
        const start = Math.floor(bucket * bucketSize);
        const end = Math.floor((bucket + 1) * bucketSize);
        let minIndex = start;
        let maxIndex = start;
        for (let i = start + 1; i < end; i++) {
            if (pattern[i] < pattern[minIndex]) {
                minIndex = i;
            }
            if (pattern[i] > pattern[maxIndex]) {
                maxIndex = i;
            }
        }
        const first = Math.min(minIndex, maxIndex);
        const second = Math.max(minIndex, maxIndex);
        data.push({ x: first, y: pattern[first] });
        if (second !== first) {
            data.push({ x: second, y: pattern[second] });
        }
    }
    return data;
};

type Props = {
    isOpen: boolean;
    onToggle: () => void;
    pattern: PatternType | null;
};

const PatternPanel = ({ isOpen, onToggle, pattern }: Props) => {
    const chartData = useMemo(
        () => (pattern === null ? [] : toChartData(pattern.pattern)),
        [pattern],
    );

    const statusText = pattern === null
        ? 'Waiting for the pattern...'
        : `Measured at ${new Date(pattern.measuredAt).toLocaleTimeString()}`;

    return (
        <Stack>
            <Stack
                direction='row'
                sx={{ justifyContent: 'space-between', alignItems: 'center' }}
            >
                <Typography variant='subtitle2'>
                    Interferometer Pattern
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
                    <Typography variant='body2' sx={{ alignSelf: 'flex-start' }}>
                        {statusText}
                    </Typography>
                    <Box sx={{ width: '90%', height: '250px' }}>
                        {pattern !== null && <ResponsiveLine
                            data={[
                                {
                                    id: 'pattern',
                                    data: chartData,
                                },
                            ]}
                            xScale={{
                                type: 'linear',
                                min: 0,
                                max: pattern.pattern.length - 1,
                            }}
                            yScale={{
                                type: 'linear',
                                min: 'auto',
                                max: 'auto',
                            }}
                            margin={{
                                top: 10,
                                right: 30,
                                bottom: 40,
                                left: 60,
                            }}
                            curve='linear'
                            lineWidth={1}
                            enablePoints={false}
                            enableGridX
                            enableGridY
                            axisBottom={{
                                tickValues: 5,
                                legend: 'Pixel',
                                legendOffset: 32,
                                legendPosition: 'middle',
                            }}
                            axisLeft={{
                                tickValues: 5,
                                legend: 'Intensity',
                                legendOffset: -50,
                                legendPosition: 'middle',
                            }}
                            isInteractive={false}
                            animate={false}
                        />}
                    </Box>
                </Stack>
            </Collapse>
        </Stack>
    );
};

export default PatternPanel;
