import { HABIT_DEFINITIONS, type HabitType } from "@/constants/habits";
import type { ThemeColors } from "@/constants/theme";
import { useThemedStyles } from "@/hooks/useThemeColors";
import { useElapsedTime } from "@/hooks/useElapsedTime";
import { formatDisplayDate } from "@/utils/datetime";
import MaterialIcons from "@react-native-vector-icons/material-icons";
import { StyleSheet, Text, View } from "react-native";

interface HabitCardProps {
    type: HabitType;
    /** "YYYY-MM-DD" */
    startDate: string;
    /** "HH:mm:ss" */
    startTime?: string;
}

export default function HabitCard({ type, startDate, startTime = "00:00:00" }: HabitCardProps) {
    const { isFuture, days, hours, minutes, seconds } = useElapsedTime(startDate, startTime);
    const { styles } = useThemedStyles(createStyles);
    const { title, icon } = HABIT_DEFINITIONS[type];

    const timeUnits = [
        { label: "Hours", value: hours },
        { label: "Minutes", value: minutes },
        { label: "Seconds", value: seconds },
    ];

    return (
        <View style={styles.card}>
            <View style={styles.watermarkContainer} pointerEvents="none">
                <MaterialIcons name={icon} style={styles.watermarkIcon} />
            </View>

            <View style={styles.header}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.subtitle}>
                    {isFuture ? "Starting" : "Since"} {formatDisplayDate(startDate)}
                </Text>

                <Text style={styles.dayCount}>{days}</Text>
                <Text style={styles.dayCountLabel}>DAYS CLEAN</Text>
            </View>

            <View style={styles.timeUnitRow}>
                {timeUnits.map(({ label, value }) => (
                    <View key={label} style={styles.timeUnit}>
                        <Text style={styles.timeUnitValue}>{value}</Text>
                        <Text style={styles.timeUnitLabel}>{label}</Text>
                    </View>
                ))}
            </View>
        </View>
    );
}

const createStyles = (colors: ThemeColors) =>
    StyleSheet.create({
        card: {
            backgroundColor: colors.surface,
            borderRadius: 16,
            overflow: "hidden",
            position: "relative",
        },
        watermarkContainer: {
            position: "absolute",
            right: 30,
            top: 30,
            zIndex: 0,
        },
        watermarkIcon: {
            fontSize: 180,
            color: colors.accentWatermark,
            opacity: 0.5,
        },
        header: {
            padding: 20,
            zIndex: 1,
        },
        title: {
            fontWeight: "bold",
            fontSize: 16,
            color: colors.textHeading,
        },
        subtitle: {
            fontSize: 12,
            marginBottom: 20,
            color: colors.textInfo,
        },
        dayCount: {
            fontWeight: "bold",
            fontSize: 40,
            color: colors.textDisplay,
        },
        dayCountLabel: {
            fontSize: 10,
            marginTop: -5,
            color: colors.textMuted,
        },
        timeUnitRow: {
            flexDirection: "row",
            width: "100%",
            justifyContent: "center",
            alignItems: "center",
            gap: 10,
            padding: 10,
            zIndex: 1,
        },
        timeUnit: {
            backgroundColor: colors.surfaceAlt,
            justifyContent: "center",
            alignItems: "center",
            width: "25%",
            padding: 10,
            borderRadius: 7,
            marginBottom: 10,
        },
        timeUnitValue: {
            fontSize: 25,
            fontWeight: "bold",
            color: colors.textTimeValue,
        },
        timeUnitLabel: {
            fontSize: 12,
            color: colors.textSubtle,
        },
    });
