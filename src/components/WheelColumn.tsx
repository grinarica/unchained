import type { ThemeColors } from "@/constants/theme";
import { useThemedStyles } from "@/hooks/useThemeColors";
import { useEffect, useRef } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    type NativeScrollEvent,
    type NativeSyntheticEvent,
} from "react-native";

const ITEM_HEIGHT = 44;
const VISIBLE_ROWS = 5; // must be odd so one row sits in the centre
const PADDING_ROWS = (VISIBLE_ROWS - 1) / 2;

export interface WheelItem<T extends string | number> {
    label: string;
    value: T;
}

interface WheelColumnProps<T extends string | number> {
    items: readonly WheelItem<T>[];
    selectedValue: T;
    onChange: (value: T) => void;
    /** Relative width inside a row of columns. */
    flex?: number;
    accessibilityLabel: string;
}

/** A vertically scrolling, snapping picker column (iOS-style wheel). */
export default function WheelColumn<T extends string | number>({
    items,
    selectedValue,
    onChange,
    flex = 1,
    accessibilityLabel,
}: WheelColumnProps<T>) {
    const { styles } = useThemedStyles(createStyles);
    const scrollRef = useRef<ScrollView>(null);
    const isReady = useRef(false);

    const selectedIndex = Math.max(
        0,
        items.findIndex((item) => item.value === selectedValue),
    );
    // The index the wheel is currently showing, so we only re-scroll for changes made from outside.
    const shownIndex = useRef(selectedIndex);

    const scrollToIndex = (index: number, animated: boolean) => {
        scrollRef.current?.scrollTo({ y: index * ITEM_HEIGHT, animated });
    };

    // The parent changed the value (e.g. day clamped when switching to a shorter month).
    useEffect(() => {
        if (isReady.current && selectedIndex !== shownIndex.current) {
            shownIndex.current = selectedIndex;
            scrollToIndex(selectedIndex, false);
        }
    }, [selectedIndex]);

    const selectIndex = (index: number) => {
        shownIndex.current = index;
        const item = items[index];
        if (item && item.value !== selectedValue) onChange(item.value);
    };

    const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const rawIndex = Math.round(event.nativeEvent.contentOffset.y / ITEM_HEIGHT);
        selectIndex(Math.min(Math.max(rawIndex, 0), items.length - 1));
    };

    return (
        <View style={[styles.column, { flex }]} accessibilityLabel={accessibilityLabel}>
            <View style={styles.selectionBand} pointerEvents="none" />

            <ScrollView
                ref={scrollRef}
                showsVerticalScrollIndicator={false}
                snapToInterval={ITEM_HEIGHT}
                decelerationRate="fast"
                contentOffset={{ x: 0, y: selectedIndex * ITEM_HEIGHT }}
                contentContainerStyle={styles.content}
                onContentSizeChange={() => {
                    // Android ignores `contentOffset`, so position the wheel once content has a size.
                    if (!isReady.current) {
                        isReady.current = true;
                        scrollToIndex(selectedIndex, false);
                    }
                }}
                onMomentumScrollEnd={handleScrollEnd}
                onScrollEndDrag={handleScrollEnd}
            >
                {items.map((item, index) => {
                    const isSelected = index === selectedIndex;
                    return (
                        <TouchableOpacity
                            key={String(item.value)}
                            style={styles.item}
                            activeOpacity={0.6}
                            onPress={() => {
                                scrollToIndex(index, true);
                                selectIndex(index);
                            }}
                        >
                            <Text style={[styles.itemText, isSelected && styles.itemTextSelected]}>
                                {item.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
}

const createStyles = (colors: ThemeColors) =>
    StyleSheet.create({
        column: {
            height: ITEM_HEIGHT * VISIBLE_ROWS,
        },
        selectionBand: {
            position: "absolute",
            left: 4,
            right: 4,
            top: ITEM_HEIGHT * PADDING_ROWS,
            height: ITEM_HEIGHT,
            borderRadius: 10,
            backgroundColor: colors.surfaceSelected,
            borderWidth: 1,
            borderColor: colors.accent,
        },
        content: {
            paddingVertical: ITEM_HEIGHT * PADDING_ROWS,
        },
        item: {
            height: ITEM_HEIGHT,
            alignItems: "center",
            justifyContent: "center",
        },
        itemText: {
            fontSize: 18,
            color: colors.textSubtle,
        },
        itemTextSelected: {
            fontSize: 20,
            fontWeight: "bold",
            color: colors.textHeading,
        },
    });
