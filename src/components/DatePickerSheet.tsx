import { useState } from "react";
import PickerSheet from "./PickerSheet";
import WheelColumn, { type WheelItem } from "./WheelColumn";

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const YEARS_BACK = 60;
const YEARS_FORWARD = 1;

const MONTH_ITEMS: WheelItem<number>[] = MONTH_NAMES.map((label, value) => ({ label, value }));

const getDaysInMonth = (year: number, monthIndex: number): number => new Date(year, monthIndex + 1, 0).getDate();

const toRange = (from: number, to: number): WheelItem<number>[] =>
    Array.from({ length: to - from + 1 }, (_, i) => ({ label: String(from + i), value: from + i }));

interface DateParts {
    year: number;
    /** 0-based, like Date#getMonth. */
    month: number;
    day: number;
}

const toParts = (date: Date): DateParts => ({
    year: date.getFullYear(),
    month: date.getMonth(),
    day: date.getDate(),
});

interface DatePickerSheetProps {
    visible: boolean;
    value: Date;
    /** Receives `value` with only its date part replaced; the time of day is kept. */
    onConfirm: (date: Date) => void;
    onCancel: () => void;
}

export default function DatePickerSheet({ visible, value, onConfirm, onCancel }: DatePickerSheetProps) {
    const [parts, setParts] = useState<DateParts>(() => toParts(value));
    const [wasVisible, setWasVisible] = useState(visible);

    // Start from the current value every time the sheet opens.
    if (visible !== wasVisible) {
        setWasVisible(visible);
        if (visible) setParts(toParts(value));
    }

    const thisYear = new Date().getFullYear();
    const yearItems = toRange(Math.min(thisYear - YEARS_BACK, parts.year), Math.max(thisYear + YEARS_FORWARD, parts.year));
    const dayItems = toRange(1, getDaysInMonth(parts.year, parts.month));

    // Changing month or year can make the chosen day invalid (e.g. 31 -> February), so clamp it.
    const updateMonthOrYear = (next: Pick<DateParts, "year" | "month">) =>
        setParts((current) => ({ ...next, day: Math.min(current.day, getDaysInMonth(next.year, next.month)) }));

    const handleConfirm = () => {
        const result = new Date(value);
        result.setFullYear(parts.year, parts.month, parts.day);
        onConfirm(result);
    };

    return (
        <PickerSheet visible={visible} title="Select Start Date" onConfirm={handleConfirm} onCancel={onCancel}>
            {visible && (
                <>
                    <WheelColumn
                        accessibilityLabel="Day"
                        items={dayItems}
                        selectedValue={parts.day}
                        onChange={(day) => setParts((current) => ({ ...current, day }))}
                    />
                    <WheelColumn
                        accessibilityLabel="Month"
                        flex={1.3}
                        items={MONTH_ITEMS}
                        selectedValue={parts.month}
                        onChange={(month) => updateMonthOrYear({ year: parts.year, month })}
                    />
                    <WheelColumn
                        accessibilityLabel="Year"
                        flex={1.3}
                        items={yearItems}
                        selectedValue={parts.year}
                        onChange={(year) => updateMonthOrYear({ year, month: parts.month })}
                    />
                </>
            )}
        </PickerSheet>
    );
}
