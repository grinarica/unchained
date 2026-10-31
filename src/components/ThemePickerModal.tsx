import type { ThemeColors } from "@/constants/theme";
import { useThemedStyles } from "@/hooks/useThemeColors";
import type { ThemePreference } from "@/libs/themePreference";
import MaterialIcons from "@react-native-vector-icons/material-icons";
import type { ComponentProps } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type IconName = ComponentProps<typeof MaterialIcons>["name"];

const OPTIONS: readonly { value: ThemePreference; label: string; icon: IconName }[] = [
    { value: "system", label: "System", icon: "brightness-auto" },
    { value: "light", label: "Light", icon: "light-mode" },
    { value: "dark", label: "Dark", icon: "dark-mode" },
];

interface ThemePickerModalProps {
    visible: boolean;
    value: ThemePreference;
    onSelect: (preference: ThemePreference) => void;
    onClose: () => void;
}

export default function ThemePickerModal({ visible, value, onSelect, onClose }: ThemePickerModalProps) {
    const { colors, styles } = useThemedStyles(createStyles);

    return (
        <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
            <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
                <View style={styles.menu}>
                    <Text style={styles.menuTitle}>Appearance</Text>

                    {OPTIONS.map((option) => {
                        const isSelected = option.value === value;
                        return (
                            <TouchableOpacity
                                key={option.value}
                                style={[styles.option, isSelected && styles.optionSelected]}
                                onPress={() => {
                                    onSelect(option.value);
                                    onClose();
                                }}
                                activeOpacity={0.8}
                                accessibilityRole="radio"
                                accessibilityState={{ selected: isSelected }}
                            >
                                <View style={styles.optionLeft}>
                                    <MaterialIcons
                                        name={option.icon}
                                        size={22}
                                        color={isSelected ? colors.accent : colors.textMuted}
                                    />
                                    <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                                        {option.label}
                                    </Text>
                                </View>
                                {isSelected && <MaterialIcons name="check" size={20} color={colors.accent} />}
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </TouchableOpacity>
        </Modal>
    );
}

const createStyles = (colors: ThemeColors) =>
    StyleSheet.create({
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
        optionLeft: {
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
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