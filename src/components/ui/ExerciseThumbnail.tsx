import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { exerciseService } from "../../services/exerciseService";
import { useAppTheme } from "../../hooks/useAppTheme";

type ThumbnailSource = { uri: string; headers: { Authorization: string } };

export default function ExerciseThumbnail({ exerciseId }: { exerciseId: number }) {
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

  if (hasError || source === null) {
    return (
      <View style={[styles.base, { backgroundColor: t.surfaceElevated, borderColor: t.surfaceBorder }]}>
        <Ionicons name="barbell-outline" size={26} color={t.textTertiary} />
      </View>
    );
  }

  return (
    <Image
      source={source}
      style={[styles.base, { backgroundColor: t.surfaceElevated }]}
      contentFit="cover"
      onError={() => setHasError(true)}
      transition={150}
    />
  );
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
