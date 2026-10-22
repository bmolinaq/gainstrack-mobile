import { useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { exerciseService } from "../../services/exerciseService";
import { useAppTheme } from "../../hooks/useAppTheme";

type ThumbnailSource = { uri: string; headers: { Authorization: string } };

interface ExerciseThumbnailProps {
  exerciseId: number;
  onPress?: () => void;
}

export default function ExerciseThumbnail({ exerciseId, onPress }: ExerciseThumbnailProps) {
  const t = useAppTheme();
  const [source, setSource] = useState<ThumbnailSource | null>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    exerciseService.image(exerciseId).then((src) => {
      if (!cancelled) setSource(src);
    });
    return () => {
      cancelled = true;
    };
  }, [exerciseId]);

  const content =
    hasError || source === null ? (
      <View style={[styles.base, { backgroundColor: t.surfaceElevated, borderColor: t.surfaceBorder }]}>
        <Ionicons name="barbell-outline" size={26} color={t.textTertiary} />
      </View>
    ) : (
      <Image
        source={source}
        style={[styles.base, { backgroundColor: t.surfaceElevated }]}
        contentFit="cover"
        onError={() => setHasError(true)}
        transition={150}
      />
    );

  if (onPress !== undefined) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  base: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
});
