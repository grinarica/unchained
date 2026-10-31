import ConfirmModal from "@/components/ConfirmModal";
import { HABIT_DEFINITIONS, isHabitType } from "@/constants/habits";
import type { ThemeColors } from "@/constants/theme";
import { useElapsedTime } from "@/hooks/useElapsedTime";
import { useThemedStyles } from "@/hooks/useThemeColors";
import { deactivateHabit, getHabit, startHabit, type Habit } from "@/libs/database";
import { formatDisplayDate, formatDisplayTime, toDateString, toTimeString } from "@/utils/datetime";
import MaterialIcons from "@react-native-vector-icons/material-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type LoadState = "loading" | "ready" | "not-found";

export default function HabitDetailScreen() {
    const router = useRouter();
    const { colors, styles } = useThemedStyles(createStyles);
    const insets = useSafeAreaInsets();

    // Route params come from outside the app (deep links, typed URLs), so never trust them blindly.
    const { type: rawType } = useLocalSearchParams<{ type?: string | string[] }>();
    const candidateType = Array.isArray(rawType) ? rawType[0] : rawType;
    const habitType = isHabitType(candidateType) ? candidateType : null;

    const [habit, setHabit] = useState<Habit | null>(null);
    const [loadState, setLoadState] = useState<LoadState>(habitType ? "loading" : "not-found");
    const [isResetDialogVisible, setIsResetDialogVisible] = useState(false);
    const [isRemoveDialogVisible, setIsRemoveDialogVisible] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const { isFuture, days, hours, minutes, seconds } = useElapsedTime(habit?.startDate, habit?.startTime);

    const loadHabit = useCallback(async (): Promise<boolean> => {
        if (!habitType) return false;

        try {
            const loadedHabit = await getHabit(habitType);
            if (loadedHabit?.isActive) {
                setHabit(loadedHabit);
                setLoadState("ready");
                return true;
            }
        } catch {
            // Fall through to the "not found" state; details are intentionally not surfaced.
        }

        setHabit(null);
        setLoadState("not-found");
        return false;
    }, [habitType]);

    useEffect(() => {
        loadHabit();
    }, [loadHabit]);

    const handleReset = async () => {
        setIsResetDialogVisible(false);
        if (!habitType) return;

        try {
            const now = new Date();
            await startHabit(habitType, toDateString(now), toTimeString(now));
            await loadHabit();
        } catch {
            setErrorMessage("Couldn't reset the timer. Please try again.");
        }
    };

    const handleRemove = async () => {
        setIsRemoveDialogVisible(false);
        if (!habitType) return;

        try {
            await deactivateHabit(habitType);
            router.back();
        } catch {
            setErrorMessage("Couldn't remove the tracker. Please try again.");
        }
    };

    if (!habitType || loadState === "not-found") {
        return (
            <View style={[styles.container, styles.centered]}>
                <Text style={styles.statusText}>Tracker not found.</Text>
                <TouchableOpacity onPress={() => router.replace("/")} style={styles.resetButton} activeOpacity={0.8}>
                    <Text style={styles.resetButtonText}>Go Home</Text>
                </TouchableOpacity>
            </View>
        );
    }

    if (loadState === "loading" || !habit) {
        return (
            <View style={[styles.container, styles.centered]}>
                <Text style={styles.statusText}>Loading...</Text>
            </View>
        );
    }

    const { title, icon } = HABIT_DEFINITIONS[habitType];
    const timeUnits = [
        { label: "Hours", value: hours },
        { label: "Minutes", value: minutes },
        { label: "Seconds", value: seconds },
    ];

    return (
        <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 20) }]}>
            <View style={styles.watermarkContainer} pointerEvents="none">
                <MaterialIcons name={icon} style={styles.watermarkIcon} />
            </View>

            <TouchableOpacity
                style={[styles.backButton, { top: Math.max(insets.top + 10, 50) }]}
                onPress={() => router.back()}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Go back"
            >
                <MaterialIcons name="arrow-back" size={24} color={colors.textPrimary} />
                <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>

            <View style={styles.topContainer}>
                <View style={styles.header}>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.subtitle}>
                        {isFuture ? "Starting" : "Since"} {formatDisplayDate(habit.startDate)} at{" "}
                        {formatDisplayTime(habit.startTime)}
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

            <View style={styles.actions}>
                <TouchableOpacity
                    style={styles.resetButton}
                    onPress={() => setIsResetDialogVisible(true)}
                    activeOpacity={0.8}
                >
                    <Text style={styles.resetButtonText}>Reset Timer (Relapsed)</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => setIsRemoveDialogVisible(true)}
                    activeOpacity={0.8}
                >
                    <Text style={styles.removeButtonText}>Remove Card</Text>
                </TouchableOpacity>
            </View>

            <ConfirmModal
                visible={isResetDialogVisible}
                title="Reset Timer"
                message={`Are you sure you want to reset your ${habitType} timer? Your streak will start again from now.`}
                confirmLabel="Reset"
                tone="danger"
                onConfirm={handleReset}
                onCancel={() => setIsResetDialogVisible(false)}
            />
            <ConfirmModal
                visible={isRemoveDialogVisible}
                title="Remove Tracker"
                message={`Remove this ${habitType} card from your home screen?`}
                confirmLabel="Remove"
                tone="danger"
                onConfirm={handleRemove}
                onCancel={() => setIsRemoveDialogVisible(false)}
            />
            <ConfirmModal
                visible={errorMessage !== null}
                title="Something went wrong"
                message={errorMessage ?? ""}
                confirmLabel="OK"
                cancelLabel={null}
                onConfirm={() => setErrorMessage(null)}
                onCancel={() => setErrorMessage(null)}
            />
        </View>
    );
}

const createStyles = (colors: ThemeColors) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
            paddingHorizontal: 24,
            paddingTop: 120,
            justifyContent: "space-between",
            position: "relative",
        },
        centered: {
            justifyContent: "center",
            alignItems: "center",
            gap: 16,
            paddingTop: 0,
        },
        statusText: {
            color: colors.textPrimary,
            fontSize: 16,
        },
        watermarkContainer: {
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: "center",
            alignItems: "center",
            zIndex: 0,
        },
        watermarkIcon: {
            fontSize: 260,
            color: colors.accentWatermark,
            opacity: 0.12,
        },
        backButton: {
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            position: "absolute",
            left: 24,
            zIndex: 10,
        },
        backButtonText: {
            color: colors.textPrimary,
            fontSize: 16,
            fontWeight: "600",
        },
        topContainer: {
            zIndex: 1,
            width: "100%",
        },
        header: {
            marginBottom: 30,
            alignItems: "center",
        },
        title: {
            fontWeight: "bold",
            fontSize: 32,
            color: colors.textHeading,
            marginBottom: 6,
            textAlign: "center",
        },
        subtitle: {
            fontSize: 13,
            marginBottom: 24,
            color: colors.textInfo,
            textAlign: "center",
        },
        dayCount: {
            fontWeight: "bold",
            fontSize: 72,
            color: colors.textDisplay,
            textAlign: "center",
        },
        dayCountLabel: {
            fontSize: 11,
            fontWeight: "600",
            letterSpacing: 1.5,
            marginTop: -5,
            color: colors.textMuted,
            textAlign: "center",
        },
        timeUnitRow: {
            flexDirection: "row",
            width: "100%",
            justifyContent: "space-between",
            alignItems: "center",
        },
        timeUnit: {
            backgroundColor: colors.surfaceSubtle,
            justifyContent: "center",
            alignItems: "center",
            width: "31%",
            paddingVertical: 16,
            borderRadius: 12,
        },
        timeUnitValue: {
            fontSize: 24,
            fontWeight: "bold",
            color: colors.textPrimary,
        },
        timeUnitLabel: {
            fontSize: 12,
            color: colors.textSubtle,
            marginTop: 2,
        },
        actions: {
            zIndex: 1,
            width: "100%",
            gap: 12,
        },
        resetButton: {
            backgroundColor: colors.accent,
            padding: 16,
            borderRadius: 12,
            alignItems: "center",
        },
        resetButtonText: {
            color: colors.onAccent,
            fontWeight: "bold",
            fontSize: 16,
        },
        removeButton: {
            backgroundColor: "transparent",
            borderWidth: 2,
            borderColor: colors.dangerBorder,
            padding: 16,
            borderRadius: 12,
            alignItems: "center",
            marginBottom: 20,
        },
        removeButtonText: {
            color: colors.dangerText,
            fontWeight: "bold",
            fontSize: 16,
        },
    });