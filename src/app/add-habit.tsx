import DatePickerSheet from "@/components/DatePickerSheet";
import HabitTypeDropdown from "@/components/HabitTypeDropdown";
import TimePickerSheet from "@/components/TimePickerSheet";
import { HABIT_TYPES, type HabitType } from "@/constants/habits";
import type { ThemeColors } from "@/constants/theme";
import { useThemedStyles } from "@/hooks/useThemeColors";
import { getAllHabits, startHabit } from "@/libs/database";
import { toDateString, toTimeString } from "@/utils/datetime";
import MaterialIcons from "@react-native-vector-icons/material-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/** "Now", without the seconds, so a saved start time is exactly what the picker shows. */
function getCurrentMinute(): Date {
    const now = new Date();
    now.setSeconds(0, 0);
    return now;
}

export default function AddHabitScreen() {
    const router = useRouter();
    const { colors, styles } = useThemedStyles(createStyles);
    const insets = useSafeAreaInsets();

    const [availableTypes, setAvailableTypes] = useState<HabitType[]>([]);
    const [isLoadingTypes, setIsLoadingTypes] = useState(true);
    const [selectedType, setSelectedType] = useState<HabitType | null>(null);

    const [startAt, setStartAt] = useState<Date>(getCurrentMinute);
    const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
    const [isTimePickerVisible, setIsTimePickerVisible] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Only offer habits that are not already being tracked, so an active streak can't be overwritten here.
    useEffect(() => {
        let isCancelled = false;

        const loadAvailableTypes = async () => {
            try {
                const habits = await getAllHabits();
                if (isCancelled) return;

                const inactiveTypes = HABIT_TYPES.filter((type) =>
                    habits.some((habit) => habit.type === type && !habit.isActive),
                );
                setAvailableTypes(inactiveTypes);
                setSelectedType(inactiveTypes[0] ?? null);
            } catch {
                // Leave the list empty; the screen shows the "nothing to add" message.
            } finally {
                if (!isCancelled) setIsLoadingTypes(false);
            }
        };

        loadAvailableTypes();
        return () => {
            isCancelled = true;
        };
    }, []);

    const handleDateConfirm = (date: Date) => {
        setStartAt(date);
        setIsDatePickerVisible(false);
    };

    const handleTimeConfirm = (date: Date) => {
        setStartAt(date);
        setIsTimePickerVisible(false);
    };

    const handleSave = async () => {
        if (!selectedType || isSaving) return;

        setIsSaving(true);
        try {
            await startHabit(selectedType, toDateString(startAt), toTimeString(startAt));
            router.back();
        } catch {
            setIsSaving(false);
            Alert.alert("Something went wrong", "Couldn't save the tracker. Please try again.");
        }
    };

    const displayDate = `${startAt.getDate()}.${startAt.getMonth() + 1}.${startAt.getFullYear()}`;
    const displayTime = toTimeString(startAt).slice(0, 5);

    return (
        <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 20) }]}>
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.back()}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Go back"
            >
                <MaterialIcons name="arrow-back" size={24} color={colors.textPrimary} />
                <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>

            <View style={styles.content}>
                <Text style={styles.screenTitle}>Add New Tracker</Text>

                {selectedType ? (
                    <>
                        <Text style={styles.screenSubtitle}>Select your milestone type and start date/time.</Text>

                        <View style={styles.field}>
                            <Text style={styles.label}>Habit Type</Text>
                            <HabitTypeDropdown
                                value={selectedType}
                                options={availableTypes}
                                onSelect={setSelectedType}
                            />
                        </View>

                        <View style={styles.field}>
                            <Text style={styles.label}>Start Date</Text>
                            <TouchableOpacity
                                style={styles.selectorButton}
                                onPress={() => setIsDatePickerVisible(true)}
                                activeOpacity={0.8}
                            >
                                <View style={styles.selectorContent}>
                                    <MaterialIcons name="calendar-today" size={20} color={colors.accent} />
                                    <Text style={styles.selectorText}>{displayDate}</Text>
                                </View>
                                <MaterialIcons name="chevron-right" size={22} color={colors.textSubtle} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.field}>
                            <Text style={styles.label}>Start Time</Text>
                            <TouchableOpacity
                                style={styles.selectorButton}
                                onPress={() => setIsTimePickerVisible(true)}
                                activeOpacity={0.8}
                            >
                                <View style={styles.selectorContent}>
                                    <MaterialIcons name="access-time" size={20} color={colors.accent} />
                                    <Text style={styles.selectorText}>{displayTime}</Text>
                                </View>
                                <MaterialIcons name="chevron-right" size={22} color={colors.textSubtle} />
                            </TouchableOpacity>
                        </View>

                    </>
                ) : (
                    <Text style={styles.screenSubtitle}>
                        {isLoadingTypes ? "Loading..." : "All trackers are already active."}
                    </Text>
                )}
            </View>

            <TouchableOpacity
                style={[styles.saveButton, (!selectedType || isSaving) && styles.saveButtonDisabled]}
                onPress={handleSave}
                disabled={!selectedType || isSaving}
                activeOpacity={0.85}
            >
                <Text style={styles.saveButtonText}>Activate Tracker</Text>
            </TouchableOpacity>

            <DatePickerSheet
                visible={isDatePickerVisible}
                value={startAt}
                onConfirm={handleDateConfirm}
                onCancel={() => setIsDatePickerVisible(false)}
            />
            <TimePickerSheet
                visible={isTimePickerVisible}
                value={startAt}
                onConfirm={handleTimeConfirm}
                onCancel={() => setIsTimePickerVisible(false)}
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
            paddingTop: 100,
            justifyContent: "space-between",
            position: "relative",
        },
        backButton: {
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            position: "absolute",
            top: 60,
            left: 24,
            zIndex: 10,
        },
        backButtonText: {
            color: colors.textPrimary,
            fontSize: 16,
            fontWeight: "600",
        },
        content: {
            width: "100%",
            marginTop: 10,
        },
        screenTitle: {
            fontSize: 28,
            fontWeight: "bold",
            color: colors.textHeading,
            marginBottom: 4,
        },
        screenSubtitle: {
            fontSize: 13,
            color: colors.textDim,
            marginBottom: 30,
        },
        field: {
            marginBottom: 20,
        },
        label: {
            fontSize: 13,
            fontWeight: "600",
            color: colors.textMuted,
            marginBottom: 8,
            letterSpacing: 0.5,
        },
        selectorButton: {
            backgroundColor: colors.surface,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.border,
            paddingHorizontal: 16,
            paddingVertical: 14,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
        },
        selectorContent: {
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
        },
        selectorText: {
            fontSize: 16,
            color: colors.textPrimary,
            fontWeight: "500",
        },
        saveButton: {
            backgroundColor: colors.accent,
            padding: 16,
            borderRadius: 12,
            alignItems: "center",
            width: "100%",
            zIndex: 10,
            marginBottom: 20,
        },
        saveButtonDisabled: {
            opacity: 0.5,
        },
        saveButtonText: {
            color: colors.onAccent,
            fontWeight: "bold",
            fontSize: 16,
        },
    });
