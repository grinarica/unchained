import type { ThemeColors } from "@/constants/theme";
import { useThemedStyles } from "@/hooks/useThemeColors";
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface ConfirmModalProps {
    visible: boolean;
    title: string;
    message: string;
    confirmLabel: string;
    /** Label for the dismiss button. Pass null for a single-button (info / error) dialog. */
    cancelLabel?: string | null;
    /** "danger" gives the confirm button the red outlined style; "accent" the gold filled style. */
    tone?: "accent" | "danger";
    onConfirm: () => void;
    onCancel: () => void;
}

/** Themed replacement for Alert.alert: a centred card with a title, a message and one or two buttons. */
export default function ConfirmModal({
    visible,
    title,
    message,
    confirmLabel,
    cancelLabel = "Cancel",
    tone = "accent",
    onConfirm,
    onCancel,
}: ConfirmModalProps) {
    const { styles } = useThemedStyles(createStyles);
    const isDanger = tone === "danger";

    return (
        <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onCancel}>
            <View style={styles.overlay}>
                <Pressable style={StyleSheet.absoluteFill} onPress={onCancel} accessibilityLabel="Dismiss" />

                <View style={styles.card} accessibilityViewIsModal>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.message}>{message}</Text>

                    <View style={styles.actions}>
                        {cancelLabel !== null && (
                            <TouchableOpacity style={styles.cancelButton} onPress={onCancel} activeOpacity={0.8}>
                                <Text style={styles.cancelText}>{cancelLabel}</Text>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity
                            style={[styles.confirmButton, isDanger ? styles.confirmDanger : styles.confirmAccent]}
                            onPress={onConfirm}
                            activeOpacity={0.85}
                        >
                            <Text style={[styles.confirmText, isDanger ? styles.confirmTextDanger : styles.confirmTextAccent]}>
                                {confirmLabel}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
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
        card: {
            width: "100%",
            backgroundColor: colors.surface,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: colors.border,
            padding: 20,
            gap: 8,
        },
        title: {
            fontSize: 20,
            fontWeight: "bold",
            color: colors.textHeading,
            textAlign: "center",
        },
        message: {
            fontSize: 15,
            lineHeight: 21,
            color: colors.textMuted,
            textAlign: "center",
            marginBottom: 12,
        },
        actions: {
            flexDirection: "row",
            gap: 12,
        },
        cancelButton: {
            flex: 1,
            padding: 14,
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
        confirmButton: {
            flex: 1,
            padding: 14,
            borderRadius: 12,
            alignItems: "center",
        },
        confirmAccent: {
            backgroundColor: colors.accent,
        },
        confirmDanger: {
            backgroundColor: "transparent",
            borderWidth: 2,
            borderColor: colors.dangerBorder,
        },
        confirmText: {
            fontWeight: "bold",
            fontSize: 16,
        },
        confirmTextAccent: {
            color: colors.onAccent,
        },
        confirmTextDanger: {
            color: colors.dangerText,
        },
    });