import { useEffect, useState } from 'react';

export interface PatternType {
    pattern: number[];
    measuredAt: string;
};

/**
 * Subscribes to the interferometer pattern of the channel while it is enabled.
 *
 * The pattern is large, so the socket is opened only while someone is looking at it.
 */
export const usePatternSocket = (channel: number, isEnabled: boolean) => {
    const [pattern, setPattern] = useState<PatternType | null>(null);

    useEffect(() => {
        if (!isEnabled) {
            setPattern(null);
            return;
        }

        const socket = new WebSocket(`/ws/pattern/${channel}/`);

        socket.onmessage = event => {
            setPattern(JSON.parse(event.data) as PatternType);
        };

        return () => socket.close();
    }, [channel, isEnabled]);

    return pattern;
};
