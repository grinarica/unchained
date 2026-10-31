import { useState } from "react";
import PickerSheet from "./PickerSheet";
import WheelColumn, { type WheelItem } from "./WheelColumn";

const pad2 = (n: number): string => String(n).padStart(2, "0");

const toRange = (count: number): WheelItem<number>[] =>
    Array.from({ length: count }, (_, value) => ({ label: pad2(value), value }));

const HOUR_ITEMS = toRange(24);
const MINUTE_ITEMS = toRange(60);

interface TimePickerSheetProps {
    visible: boolean;
    value: Date;
    /** Receives `value` with only its time replaced (seconds set to 0); the date is kept. */
    onConfirm: (date: Date) => void;
    onCancel: () => void;
}

export default function TimePickerSheet({ visible, value, onConfirm, onCancel }: TimePickerSheetProps) {
    const [hours, setHours] = useState(value.getHours());
    const [minutes, setMinutes] = useState(value.getMinutes());
    const [wasVisible, setWasVisible] = useState(visible);

    // Start from the current value every time the sheet opens.
    if (visible !== wasVisible) {
        setWasVisible(visible);
        if (visible) {
            setHours(value.getHours());
            setMinutes(value.getMinutes());
        }
    }

    const handleConfirm = () => {
        const result = new Date(value);
        result.setHours(hours, minutes, 0, 0);
        onConfirm(result);
    };

    return (
        <PickerSheet visible={visible} title="Select Start Time" onConfirm={handleConfirm} onCancel={onCancel}>
            {visible && (
                <>
                    <WheelColumn accessibilityLabel="Hour" items={HOUR_ITEMS} selectedValue={hours} onChange={setHours} />
                    <WheelColumn
                        accessibilityLabel="Minute"
                        items={MINUTE_ITEMS}
                        selectedValue={minutes}
                        onChange={setMinutes}
                    />
                </>
            )}
        </PickerSheet>
    );
}
