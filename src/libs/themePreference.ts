import Storage from "expo-sqlite/kv-store";
import { Appearance } from "react-native";

export const THEME_PREFERENCES = ["system", "light", "dark"] as const;

export type ThemePreference = (typeof THEME_PREFERENCES)[number];

const STORAGE_KEY = "theme-preference";

export function isThemePreference(value: unknown): value is ThemePreference {
    return typeof value === "string" && (THEME_PREFERENCES as readonly string[]).includes(value);
}

/** The saved choice, or "system" if nothing valid is stored. Synchronous, so the first render is already correct. */
export function getThemePreference(): ThemePreference {
    try {
        const stored = Storage.getItemSync(STORAGE_KEY);
        return isThemePreference(stored) ? stored : "system";
    } catch {
        return "system";
    }
}

/** Makes the whole app (and native UI like alerts) use the chosen appearance. "system" follows the device. */
export function applyThemePreference(preference: ThemePreference): void {
    // Expo Router also loads the layout in a Node/web environment while exporting, where
    // `Appearance.setColorScheme` doesn't exist. Skip it there instead of crashing the build.
    if (typeof Appearance.setColorScheme !== "function") return;

    // "auto" removes the override so the app follows the device again (`null` is no longer accepted).
    Appearance.setColorScheme(preference === "system" ? "auto" : preference);
}

export function saveThemePreference(preference: ThemePreference): void {
    try {
        Storage.setItemSync(STORAGE_KEY, preference);
    } catch {
        // Not being able to persist must not break switching themes for this session.
    }
    applyThemePreference(preference);
}
