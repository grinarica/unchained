import { darkColors, lightColors, type ThemeColors } from "@/constants/theme";
import { useMemo } from "react";
import { useColorScheme } from "react-native";

/** Colours for the device's current appearance. Falls back to dark (the original look). */
export function useThemeColors(): ThemeColors {
    const scheme = useColorScheme();
    return scheme === "light" ? lightColors : darkColors;
}

/**
 * Builds a StyleSheet from the current theme and only rebuilds it when the theme changes.
 * `createStyles` must be a stable, module-level function: `(colors) => StyleSheet.create({...})`.
 */
export function useThemedStyles<T>(createStyles: (colors: ThemeColors) => T): { colors: ThemeColors; styles: T } {
    const colors = useThemeColors();
    const styles = useMemo(() => createStyles(colors), [createStyles, colors]);
    return { colors, styles };
}
