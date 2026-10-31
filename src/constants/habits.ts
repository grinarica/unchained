import type MaterialIcons from "@react-native-vector-icons/material-icons";
import type { ComponentProps } from "react";

type MaterialIconName = ComponentProps<typeof MaterialIcons>["name"];

/** Single source of truth for every habit the app can track. */
export const HABIT_TYPES = ["smoking", "drinking", "porn"] as const;

export type HabitType = (typeof HABIT_TYPES)[number];

export interface HabitDefinition {
    /** Name shown on cards and screen titles, e.g. "Smoking Free". */
    title: string;
    /** Material icon used as the card watermark. */
    icon: MaterialIconName;
}

export const HABIT_DEFINITIONS: Record<HabitType, HabitDefinition> = {
    smoking: { title: "Smoking Free", icon: "smoke-free" },
    drinking: { title: "Drinking Free", icon: "no-drinks" },
    porn: { title: "Porn Free", icon: "no-adult-content" },
};

/**
 * Runtime type guard. Use it on anything that comes from outside the app
 * (route params, deep links, database rows) before trusting it as a HabitType.
 */
export function isHabitType(value: unknown): value is HabitType {
    return typeof value === "string" && (HABIT_TYPES as readonly string[]).includes(value);
}
