/** Colour tokens. Every theme must define the same keys (enforced by `ThemeColors`). */
export interface ThemeColors {
    background: string;
    surface: string;
    surfaceAlt: string;
    /** Barely-there fill for secondary tiles that shouldn't draw attention. */
    surfaceSubtle: string;
    surfaceRaised: string;
    surfaceSelected: string;
    surfaceAddButton: string;
    border: string;

    accent: string;
    /** Text/icon colour used on top of `accent` (buttons). */
    onAccent: string;
    accentWatermark: string;
    brandGold: string;
    brandGoldDark: string;

    textPrimary: string;
    textDisplay: string;
    textHeading: string;
    textTimeValue: string;
    textInfo: string;
    textMuted: string;
    textSubtle: string;
    textDim: string;
    textTagline: string;

    dangerBorder: string;
    dangerText: string;

    overlay: string;
}

/** The original look of the app. */
export const darkColors: ThemeColors = {
    background: "#0b131a",
    surface: "#101e2a",
    surfaceAlt: "#17232e",
    surfaceSubtle: "#0f1a24",
    surfaceRaised: "#172736",
    surfaceSelected: "#1d3244",
    surfaceAddButton: "#152533",
    border: "#1d2f3e",

    accent: "#ebb758",
    onAccent: "#101e2a",
    accentWatermark: "#d6a853",
    brandGold: "#dbb558",
    brandGoldDark: "#ad7d23",

    textPrimary: "#f4f0e4",
    textDisplay: "#f5f2e9",
    textHeading: "#e5edd1",
    textTimeValue: "#d5d2c8",
    textInfo: "#8cb4dc",
    textMuted: "#84929f",
    textSubtle: "#728191",
    textDim: "#385f87",
    textTagline: "#808080",

    dangerBorder: "#ebb758",
    dangerText: "#ebb758",

    overlay: "rgba(0,0,0,0.65)",
};

/** Warm, paper-like light theme with the same gold accent. */
export const lightColors: ThemeColors = {
    background: "#f6f2e8",
    surface: "#ffffff",
    surfaceAlt: "#f0ebdd",
    surfaceSubtle: "#efe9da",
    surfaceRaised: "#f3efe4",
    surfaceSelected: "#fbefd2",
    surfaceAddButton: "#ebe5d4",
    border: "#ddd5c0",

    accent: "#e0a52e",
    onAccent: "#ffffff",
    accentWatermark: "#d6a853",
    brandGold: "#8f6a12",
    brandGoldDark: "#8a5f0f",

    textPrimary: "#1c2733",
    textDisplay: "#14202b",
    textHeading: "#1d2b22",
    textTimeValue: "#2b3640",
    textInfo: "#2f6aa3",
    textMuted: "#5c6b78",
    textSubtle: "#5f6e7c",
    textDim: "#4a6f95",
    textTagline: "#6b6b6b",

    dangerBorder: "#e0a52e",
    dangerText: "#e0a52e",

    overlay: "rgba(0,0,0,0.45)",
};