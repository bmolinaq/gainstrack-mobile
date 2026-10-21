import Popover from "react-native-popover-view";
import { BlurView } from "expo-blur";
import { Children, ReactNode } from "react";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const POPOVER_STYLE = {
  backgroundColor: "transparent",
  borderRadius: 14,
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.12)",
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.55,
  shadowRadius: 16,
  elevation: 12,
  overflow: "hidden",
  padding: 0,
} as const;

type ItemProps = {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  danger?: boolean;
  onPress?: () => void;
};

function Item({ icon, label, danger = false, onPress }: ItemProps) {
  return (
    <TouchableOpacity style={styles.item} activeOpacity={0.7} onPress={onPress}>
      <Ionicons
        name={icon}
        size={16}
        color={danger ? "rgba(255,75,75,0.9)" : "rgba(255,255,255,0.55)"}
      />
      <Text style={danger ? styles.labelDanger : styles.label}>{label}</Text>
    </TouchableOpacity>
  );
}

type PopoverMenuProps = {
  isVisible: boolean;
  onRequestClose: () => void;
  from: (ref: any, show: () => void) => ReactNode;
  children: ReactNode;
  minWidth?: number;
};

function PopoverMenu({
  isVisible,
  onRequestClose,
  from,
  children,
  minWidth = 170,
}: PopoverMenuProps) {
  const items = Children.toArray(children);
  return (
    <Popover
      isVisible={isVisible}
      onRequestClose={onRequestClose}
      from={from}
      popoverStyle={POPOVER_STYLE}
      backgroundStyle={{ backgroundColor: "transparent" }}
    >
      <BlurView
        tint="systemUltraThinMaterialDark"
        intensity={60}
        style={[{ minWidth }, { backgroundColor: "rgba(12,12,12,0.96)" }]}
      >
        {items.map((item, index) => (
          <React.Fragment key={index}>
            {index > 0 && <View style={styles.divider} />}
            {item}
          </React.Fragment>
        ))}
      </BlurView>
    </Popover>
  );
}

PopoverMenu.Item = Item;
export default PopoverMenu;

const styles = StyleSheet.create({
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  label: {
    color: "rgba(255,255,255,0.90)",
    fontSize: 14,
    letterSpacing: 0.2,
  },
  labelDanger: {
    color: "rgba(255,75,75,0.9)",
    fontSize: 14,
    letterSpacing: 0.2,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
});
