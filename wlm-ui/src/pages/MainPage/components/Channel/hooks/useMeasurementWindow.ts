import { useEffect, useState, useRef, useMemo } from 'react';
import { MeasurementType } from '../../../../../store/slices/channel/channel';

const TIME_RANGE = 30 * 1000;
const TIME_WINDOW_UPDATE_INTERVAL_MS = 1000;

const findStartIndex = (measurements: MeasurementType[], startTime: number): number => {
    let left = 0;
    let right = measurements.length;
    while (left < right) {
        const mid = Math.floor((left + right) / 2);
        const timestamp = new Date(measurements[mid].measuredAt).getTime();
        if (timestamp < startTime) {
            left = mid + 1;
        } else {
            right = mid;
        }
    }
    return left;
};


const findEndIndex = (measurements: MeasurementType[], endTime: number): number => {
    let left = 0;
    let right = measurements.length;
    while (left < right) {
        const mid = Math.floor((left + right) / 2);
        const timestamp = new Date(measurements[mid].measuredAt).getTime();
        if (timestamp <= endTime) {
            left = mid + 1;
        } else {
            right = mid;
        }
    }
    return left - 1;
};


export const useMeasurementWindow = (
    measurements: MeasurementType[],
    shouldUpdatePlot: boolean,
) => {
    const [timeWindow, setTimeWindow] = useState<number[]>([Date.now() - TIME_RANGE, Date.now()]);
    const [isTimeSliderEnabled, setIsTimeSliderEnabled] = useState<boolean>(false);
    const [timeSliderRange, setTimeSliderRange] = useState<number[]>([]);
    const [timeSliderMarks, setTimeSliderMarks] = useState<{ value: number, label: string }[]>([]);
    const [latestMeasurementText, setLatestMeasurementText] = useState<string>('');
    const measurementsRef = useRef(measurements);

    useEffect(() => {
        measurementsRef.current = measurements;
        const latestMeasurement = measurements.at(-1);

        if (latestMeasurement !== undefined) {
            const { frequency, error } = latestMeasurement;
            if (frequency !== null) {
                setLatestMeasurementText(`${(frequency / 1e12).toFixed(6)} THz`);
            } else if (error === 'over') {
                setLatestMeasurementText('Overexposed');
            } else if (error === 'under') {
                setLatestMeasurementText('Underexposed');
            } else {
                setLatestMeasurementText('Error');
            }
        } else {
            setLatestMeasurementText('');
        }
    }, [measurements]);

    useEffect(() => {
        let intervalId: NodeJS.Timer | undefined;

        if (shouldUpdatePlot) {
            setIsTimeSliderEnabled(false);

            intervalId = setInterval(() => {
                const now = Date.now();
                const cutoffTime = new Date(now - TIME_RANGE).getTime();
                setTimeWindow([cutoffTime, now]);
            }, TIME_WINDOW_UPDATE_INTERVAL_MS);
        } else {
            clearInterval(intervalId);

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

        return () => clearInterval(intervalId);
    }, [shouldUpdatePlot]);

    const chartData = useMemo(() => {
        const currentMeasurements = measurementsRef.current;
        if (currentMeasurements.length === 0) {
            return [];
        }        
        const startIdx = findStartIndex(currentMeasurements, timeWindow[0]);
        const endIdx = findEndIndex(currentMeasurements, timeWindow[1]);        
        if (startIdx > endIdx) {
            return [];
        }    
        return currentMeasurements.slice(startIdx, endIdx + 1).map(measurement => ({
            x: new Date(measurement.measuredAt),
            y: measurement.frequency,
        }));
    }, [timeWindow, measurements]);

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

    return {
        latestMeasurementText,
        chartData,
        timeWindow,
        isTimeSliderEnabled,
        timeSliderRange,
        timeSliderMarks,
        handleTimeSlider,
    };
};
