import { useThemeColors } from "@/hooks/useThemeColors";
import { initializeDatabase } from "@/libs/database";
import { applyThemePreference, getThemePreference } from "@/libs/themePreference";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SystemUI from "expo-system-ui";
import { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, useColorScheme, View } from "react-native";

// Apply the saved Light / Dark / System choice before the first render so there is no flash of the wrong theme.
applyThemePreference(getThemePreference());

export default function RootLayout() {
    const colors = useThemeColors();
    const isLight = useColorScheme() === "light";

    const [isDatabaseReady, setIsDatabaseReady] = useState(false);
    const [hasDatabaseError, setHasDatabaseError] = useState(false);

    const navigationTheme = useMemo(() => {
        const base = isLight ? DefaultTheme : DarkTheme;
        return { ...base, colors: { ...base.colors, background: colors.background } };
    }, [isLight, colors]);

    useEffect(() => {
        // Match the native root background to the theme to avoid flashes on Android.
        SystemUI.setBackgroundColorAsync(colors.background);
    }, [colors]);

    // Create the table (and seed the default habits) once, at launch, before any screen renders.
    useEffect(() => {
        let isCancelled = false;

        initializeDatabase()
            .then(() => {
                if (!isCancelled) setIsDatabaseReady(true);
            })
            .catch(() => {
                if (!isCancelled) setHasDatabaseError(true);
            });

        return () => {
            isCancelled = true;
        };
    }, []);

    return (
        <ThemeProvider value={navigationTheme}>
            <View style={[styles.root, { backgroundColor: colors.background }]}>
                <StatusBar style={isLight ? "dark" : "light"} />

                {hasDatabaseError ? (
                    <View style={styles.centered}>
                        <Text style={[styles.errorText, { color: colors.textPrimary }]}>
                            Couldn't open your data. Please restart the app.
                        </Text>
                    </View>
                ) : isDatabaseReady ? (
                    <Stack
                        screenOptions={{
                            headerShown: false,
                            contentStyle: { backgroundColor: colors.background },
                            animation: "fade",
                            animationMatchesGesture: true,
                            gestureEnabled: true,
                        }}
                    />
                ) : null}
            </View>
        </ThemeProvider>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
    },
    centered: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 24,
    },
    errorText: {
        fontSize: 16,
        textAlign: "center",
    },
});