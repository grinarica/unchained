const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/;

const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_HOUR = 3600;
const SECONDS_PER_DAY = 86_400;

export interface ElapsedTime {
    /** True when the start moment has not been reached yet. All counters are 0 in that case. */
    isFuture: boolean;
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

const pad2 = (value: number): string => String(value).padStart(2, "0");

/** Local date as "YYYY-MM-DD". */
export function toDateString(date: Date): string {
    return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

/** Local time as "HH:mm:ss". */
export function toTimeString(date: Date): string {
    return `${pad2(date.getHours())}:${pad2(date.getMinutes())}:${pad2(date.getSeconds())}`;
}

/** True only for a real calendar date in "YYYY-MM-DD" form (rejects e.g. "2026-02-31"). */
export function isValidDateString(value: string): boolean {
    const match = DATE_PATTERN.exec(value);
    if (!match) return false;

    const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

/** True only for "HH:mm:ss" on a 24-hour clock. */
export function isValidTimeString(value: string): boolean {
    return TIME_PATTERN.test(value);
}

/**
 * Converts stored "YYYY-MM-DD" + "HH:mm:ss" (device-local time) into epoch milliseconds.
 * Returns null for malformed input instead of producing NaN.
 */
export function parseStartTimestamp(dateString: string, timeString: string): number | null {
    if (!isValidDateString(dateString) || !isValidTimeString(timeString)) return null;

    const [year, month, day] = dateString.split("-").map(Number);
    const [hours, minutes, seconds] = timeString.split(":").map(Number);
    return new Date(year, month - 1, day, hours, minutes, seconds).getTime();
}

/** Splits the gap between `startMs` and `nowMs` into days/hours/minutes/seconds. */
export function getElapsedTime(startMs: number | null, nowMs: number): ElapsedTime {
    const zero: ElapsedTime = { isFuture: false, days: 0, hours: 0, minutes: 0, seconds: 0 };

    if (startMs === null) return zero;
    if (startMs > nowMs) return { ...zero, isFuture: true };

    const totalSeconds = Math.floor((nowMs - startMs) / 1000);
    return {
        isFuture: false,
        days: Math.floor(totalSeconds / SECONDS_PER_DAY),
        hours: Math.floor((totalSeconds % SECONDS_PER_DAY) / SECONDS_PER_HOUR),
        minutes: Math.floor((totalSeconds % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE),
        seconds: totalSeconds % SECONDS_PER_MINUTE,
    };
}

/** "2026-03-14" -> "14 March 2026". Falls back to the raw string if it is not a valid date. */
export function formatDisplayDate(dateString: string): string {
    if (!isValidDateString(dateString)) return dateString;

    const [year, month, day] = dateString.split("-").map(Number);
    return new Date(year, month - 1, day).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}

/** "08:30:00" -> "08:30". Falls back to the raw string if it is not a valid time. */
export function formatDisplayTime(timeString: string): string {
    return isValidTimeString(timeString) ? timeString.slice(0, 5) : timeString;
}
