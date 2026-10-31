import type { ThemeColors } from "@/constants/theme";
import { useThemedStyles } from "@/hooks/useThemeColors";
import type { ReactNode } from "react";
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface PickerSheetProps {
    visible: boolean;
    title: string;
    onConfirm: () => void;
    onCancel: () => void;
    children: ReactNode;
}

/** Bottom sheet shell with a title and Cancel / Done buttons. Put wheel columns in `children`. */
export default function PickerSheet({ visible, title, onConfirm, onCancel, children }: PickerSheetProps) {
    const { styles } = useThemedStyles(createStyles);
    const insets = useSafeAreaInsets();

    return (
        <Modal visible={visible} transparent animationType="slide" statusBarTranslucent onRequestClose={onCancel}>
            <View style={styles.backdrop}>
                <Pressable style={StyleSheet.absoluteFill} onPress={onCancel} accessibilityLabel="Close picker" />

                <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) }]}>
                    <Text style={styles.title}>{title}</Text>

                    <View style={styles.wheels}>{children}</View>

                    <View style={styles.actions}>
                        <TouchableOpacity style={styles.cancelButton} onPress={onCancel} activeOpacity={0.8}>
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.doneButton} onPress={onConfirm} activeOpacity={0.85}>
                            <Text style={styles.doneText}>Done</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const createStyles = (colors: ThemeColors) =>
    StyleSheet.create({
        backdrop: {
            flex: 1,
            justifyContent: "flex-end",
            backgroundColor: colors.overlay,
        },
        sheet: {
            backgroundColor: colors.surface,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            borderWidth: 1,
            borderColor: colors.border,
            paddingTop: 20,
            paddingHorizontal: 20,
            gap: 16,
        },
        title: {
            fontSize: 14,
            fontWeight: "600",
            color: colors.textMuted,
            letterSpacing: 0.5,
            textAlign: "center",
        },
        wheels: {
            flexDirection: "row",
        },
        actions: {
            flexDirection: "row",
            gap: 12,
            marginBottom: 10
        },
        cancelButton: {
            flex: 1,
            padding: 16,
            borderRadius: 12,
            alignItems: "center",
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.surfaceRaised,
        },
        cancelText: {
            color: colors.textMuted,
            fontWeight: "bold",
            fontSize: 16,
        },
        doneButton: {
            flex: 1,
            padding: 16,
            borderRadius: 12,
            alignItems: "center",
            backgroundColor: colors.accent,
        },
        doneText: {
            color: colors.onAccent,
            fontWeight: "bold",
            fontSize: 16,
        },
    });
