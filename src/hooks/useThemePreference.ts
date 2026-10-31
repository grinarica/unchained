import { getThemePreference, saveThemePreference, type ThemePreference } from "@/libs/themePreference";
import { useCallback, useState } from "react";

/** The user's Light / Dark / System choice, with a setter that saves it and applies it immediately. */
export function useThemePreference(): [ThemePreference, (preference: ThemePreference) => void] {
    const [preference, setPreferenceState] = useState<ThemePreference>(getThemePreference);

    const setPreference = useCallback((next: ThemePreference) => {
        setPreferenceState(next);
        saveThemePreference(next);
    }, []);

    return [preference, setPreference];
}