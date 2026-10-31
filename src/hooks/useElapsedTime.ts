import { useEffect, useMemo, useState } from "react";
import { getElapsedTime, parseStartTimestamp, type ElapsedTime } from "@/utils/datetime";

const TICK_INTERVAL_MS = 1000;

/**
 * Live "time since" counter, refreshed every second.
 * Pass undefined while the start moment is still loading; all counters stay at 0.
 */
export function useElapsedTime(startDate?: string, startTime?: string): ElapsedTime {
    const startMs = useMemo(
        () => (startDate && startTime ? parseStartTimestamp(startDate, startTime) : null),
        [startDate, startTime],
    );

    const [elapsed, setElapsed] = useState<ElapsedTime>(() => getElapsedTime(startMs, Date.now()));

    useEffect(() => {
        const refresh = () => setElapsed(getElapsedTime(startMs, Date.now()));

        refresh();
        const intervalId = setInterval(refresh, TICK_INTERVAL_MS);
        return () => clearInterval(intervalId);
    }, [startMs]);

    return elapsed;
}
