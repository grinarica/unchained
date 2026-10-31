import { HABIT_DEFINITIONS, type HabitType } from "@/constants/habits";
import type { ThemeColors } from "@/constants/theme";
import { useThemedStyles } from "@/hooks/useThemeColors";
import MaterialIcons from "@react-native-vector-icons/material-icons";
import { useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface HabitTypeDropdownProps {
    value: HabitType;
    options: readonly HabitType[];
    onSelect: (type: HabitType) => void;
}

export default function HabitTypeDropdown({ value, options, onSelect }: HabitTypeDropdownProps) {
    const { colors, styles } = useThemedStyles(createStyles);
    const [isOpen, setIsOpen] = useState(false);

    const close = () => setIsOpen(false);

    return (
        <View>
            <TouchableOpacity
                style={styles.trigger}
                onPress={() => setIsOpen(true)}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel={`Habit type: ${HABIT_DEFINITIONS[value].title}`}
            >
                <Text style={styles.triggerText}>{HABIT_DEFINITIONS[value].title}</Text>
                <MaterialIcons name="arrow-drop-down" size={24} color={colors.accent} />
            </TouchableOpacity>

            <Modal visible={isOpen} transparent animationType="fade" onRequestClose={close}>
                <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={close}>
                    <View style={styles.menu}>
                        <Text style={styles.menuTitle}>Select Habit Type</Text>

                        {options.map((type) => {
                            const isSelected = type === value;
                            return (
                                <TouchableOpacity
                                    key={type}
                                    style={[styles.option, isSelected && styles.optionSelected]}
                                    onPress={() => {
                                        onSelect(type);
                                        close();
                                    }}
                                    activeOpacity={0.8}
                                    accessibilityRole="menuitem"
                                    accessibilityState={{ selected: isSelected }}
                                >
                                    <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                                        {HABIT_DEFINITIONS[type].title}
                                    </Text>
                                    {isSelected && <MaterialIcons name="check" size={20} color={colors.accent} />}
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}

const createStyles = (colors: ThemeColors) =>
    StyleSheet.create({
        trigger: {
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
        triggerText: {
            fontSize: 16,
            color: colors.textPrimary,
            fontWeight: "500",
        },
        overlay: {
            flex: 1,
            backgroundColor: colors.overlay,
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 24,
        },
        menu: {
            width: "100%",
            backgroundColor: colors.surface,
            borderRadius: 18,
            borderWidth: 1,
            borderColor: colors.border,
            padding: 16,
            gap: 10,
        },
        menuTitle: {
            fontSize: 14,
            fontWeight: "600",
            color: colors.textMuted,
            marginBottom: 4,
            letterSpacing: 0.5,
        },
        option: {
            backgroundColor: colors.surfaceRaised,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 14,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
        },
        optionSelected: {
            backgroundColor: colors.surfaceSelected,
            borderColor: colors.accent,
        },
        optionText: {
            fontSize: 16,
            color: colors.textMuted,
            fontWeight: "500",
        },
        optionTextSelected: {
            color: colors.textHeading,
            fontWeight: "bold",
        },
    });
