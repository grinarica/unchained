import HabitCard from "@/components/HabitCard";
import ThemePickerModal from "@/components/ThemePickerModal";
import type { ThemeColors } from "@/constants/theme";
import { useThemedStyles } from "@/hooks/useThemeColors";
import { useThemePreference } from "@/hooks/useThemePreference";
import { getAllHabits, type Habit } from "@/libs/database";
import MaterialIcons from "@react-native-vector-icons/material-icons";
import { Link, Stack, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
    const { colors, styles } = useThemedStyles(createStyles);
    const [habits, setHabits] = useState<Habit[]>([]);
    const [hasLoadError, setHasLoadError] = useState(false);
    const [themePreference, setThemePreference] = useThemePreference();
    const [isThemeModalVisible, setIsThemeModalVisible] = useState(false);

    // Reload every time the screen regains focus (e.g. after adding or removing a tracker).
    useFocusEffect(
        useCallback(() => {
            let isCancelled = false;

            const loadHabits = async () => {
                try {
                    const allHabits = await getAllHabits();
                    if (isCancelled) return;
                    setHabits(allHabits);
                    setHasLoadError(false);
                } catch {
                    if (!isCancelled) setHasLoadError(true);
                }
            };

            loadHabits();
            return () => {
                isCancelled = true;
            };
        }, []),
    );

    const activeHabits = habits.filter((habit) => habit.isActive);
    const canAddHabit = habits.some((habit) => !habit.isActive);

    return (
        <SafeAreaView style={styles.safeArea}>
            <Stack.Screen options={{ headerShown: false }} />

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.content}>
                    <TouchableOpacity
                        style={styles.themeButton}
                        onPress={() => setIsThemeModalVisible(true)}
                        activeOpacity={0.7}
                        accessibilityRole="button"
                        accessibilityLabel="Change appearance"
                    >
                        <MaterialIcons name="brightness-6" size={22} color={colors.brandGold} />
                    </TouchableOpacity>

                    <Text style={styles.appName}>UNCHAINED</Text>
                    <Text style={styles.heroTitle}>Every Second Counts.</Text>
                    <Text style={styles.heroSubtitle}>Live counters for the thing you left behind</Text>

                    {hasLoadError && (
                        <Text style={styles.errorText}>Couldn't load your trackers. Please restart the app.</Text>
                    )}

                    {activeHabits.map((habit) => (
                        <Link
                            key={habit.type}
                            href={{ pathname: "/habit/[type]", params: { type: habit.type } }}
                            asChild
                        >
                            <TouchableOpacity activeOpacity={0.8} accessibilityRole="button">
                                <HabitCard
                                    type={habit.type}
                                    startDate={habit.startDate}
                                    startTime={habit.startTime}
                                />
                            </TouchableOpacity>
                        </Link>
                    ))}

                    {canAddHabit && (
                        <Link href="/add-habit" style={styles.addButton} accessibilityLabel="Add a new tracker">
                            <Text style={styles.addButtonText}>+</Text>
                        </Link>
                    )}
                </View>
            </ScrollView>

            <ThemePickerModal
                visible={isThemeModalVisible}
                value={themePreference}
                onSelect={setThemePreference}
                onClose={() => setIsThemeModalVisible(false)}
            />
        </SafeAreaView>
    );
}

const createStyles = (colors: ThemeColors) =>
    StyleSheet.create({
        safeArea: {
            flex: 1,
        },
        scrollContent: {
            padding: 10,
        },
        content: {
            gap: 12,
            position: "relative",
        },
        themeButton: {
            position: "absolute",
            top: 12,
            right: 0,
            padding: 8,
            borderRadius: 20,
            zIndex: 1,
        },
        appName: {
            color: colors.brandGold,
            marginTop: 20,
            fontWeight: "400",
            marginBottom: -5,
        },
        heroTitle: {
            color: colors.textDisplay,
            fontWeight: "bold",
            fontSize: 30,
            marginBottom: -10,
        },
        heroSubtitle: {
            color: colors.textTagline,
            fontWeight: "300",
            marginBottom: 10,
        },
        errorText: {
            color: colors.dangerText,
        },
        addButton: {
            backgroundColor: colors.surfaceAddButton,
            padding: 12,
            borderRadius: 16,
            overflow: "hidden",
            borderColor: colors.background,
            borderWidth: 2,
        },
        addButtonText: {
            color: colors.brandGoldDark,
            fontWeight: "bold",
            textAlign: "center",
            fontSize: 30,
        },
    });