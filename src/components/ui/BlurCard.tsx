import { BlurView } from "expo-blur";
import { ReactNode } from "react";
import { StyleProp, View, ViewStyle } from "react-native";

type BlurCardProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  intensity?: number;
};

export default function BlurCard({
  children,
  style,
  contentStyle,
  intensity = 35,
}: BlurCardProps) {
  return (
    <View
      style={[
        {
          borderRadius: 20,
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.07)",
          overflow: "hidden",
        },
        style,
      ]}
    >
      <BlurView
        tint="systemUltraThinMaterialDark"
        intensity={intensity}
        style={[{ padding: 16 }, contentStyle]}
      >
        {children}
      </BlurView>
    </View>
  );
}
