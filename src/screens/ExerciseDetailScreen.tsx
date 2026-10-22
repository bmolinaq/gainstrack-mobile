import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useVideoPlayer, VideoView } from "expo-video";
import axios from "axios";
import { exerciseService } from "../services/exerciseService";
import { APIGainsTrackExerciseResponse } from "../types/exercise.types";
import { APIGainstrackErrorResponse } from "../types/api.types";
import { useAppTheme } from "../hooks/useAppTheme";
import { ThemeColors } from "../theme";

const H_PADDING = 20;

type MediaSource = { uri: string; headers: { Authorization: string } };
type MediaStage = "video" | "image" | "placeholder";

function getStyles(t: ThemeColors) {
  return StyleSheet.create({
    flex: {
      flex: 1,
      backgroundColor: t.background,
    },
    headerBar: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: H_PADDING,
      paddingTop: 14,
      paddingBottom: 14,
    },
    backButton: {
      flexDirection: "row",
      alignItems: "center",
    },
    content: {
      paddingHorizontal: H_PADDING,
      gap: 20,
    },
    mediaContainer: {
      width: "100%",
      aspectRatio: 16 / 9,
      borderRadius: 18,
      overflow: "hidden",
      backgroundColor: t.surfaceElevated,
      borderWidth: 1,
      borderColor: t.surfaceBorder,
    },
    mediaFill: {
      width: "100%",
      height: "100%",
    },
    mediaTapOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: "flex-end",
      alignItems: "flex-end",
      padding: 10,
    },
    playbackBadge: {
      width: 25,
      height: 25,
      borderRadius: 17,
      backgroundColor: "rgba(0,0,0,0.45)",
      alignItems: "center",
      justifyContent: "center",
    },
    placeholderCenter: {
      alignItems: "center",
      justifyContent: "center",
    },
    exerciseName: {
      color: t.textPrimary,
      fontFamily: "Inter-Bold",
      fontSize: 24,
      letterSpacing: 0.2,
    },
    muscleGroupPill: {
      alignSelf: "flex-start",
      backgroundColor: t.primaryMuted,
      borderColor: t.primaryBorder,
      borderWidth: 1,
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 4,
      marginTop: 10,
    },
    muscleGroupPillText: {
      color: t.textPrimary,
      fontSize: 11,
      fontFamily: "Inter-Bold",
      letterSpacing: 0.5,
    },
    errorBanner: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      backgroundColor: t.errorBg,
      borderColor: t.errorBorder,
      borderWidth: 1,
      borderRadius: 12,
      marginHorizontal: H_PADDING,
      paddingHorizontal: 16,
      paddingVertical: 14,
    },
    errorText: {
      flex: 1,
      color: t.errorText,
      fontSize: 14,
    },
  });
}

export default function ExerciseDetailScreen({ route, navigation }: any) {
  const t = useAppTheme();
  const styles = useMemo(() => getStyles(t), [t]);

  const { id } = route.params;

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [exercise, setExercise] =
    useState<APIGainsTrackExerciseResponse | null>(null);
  const [videoSource, setVideoSource] = useState<MediaSource | null>(null);
  const [imageSource, setImageSource] = useState<MediaSource | null>(null);
  const [mediaStage, setMediaStage] = useState<MediaStage>("video");
  const [isPlaying, setIsPlaying] = useState(true);

  /** Carga ejercicio + fuentes de video e imagen en paralelo */
  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const [exercises, video, image] = await Promise.all([
          exerciseService.findAll(),
          exerciseService.video(id),
          exerciseService.image(id),
        ]);
        const found = exercises.find((e) => e.id === id);
        if (found === undefined) {
          setErrorMessage("Ejercicio no encontrado");
          return;
        }
        setExercise(found);
        setVideoSource(video);
        setImageSource(image);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const apiError = error.response?.data as APIGainstrackErrorResponse;
          setErrorMessage(apiError.message);
        } else {
          setErrorMessage("Error inesperado, intente nuevamente");
        }
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [id]);

  const player = useVideoPlayer(videoSource, (p) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });

  /** Si el player reporta error, caemos a imagen */
  useEffect(() => {
    const sub = player.addListener("statusChange", ({ status }) => {
      if (status === "error") {
        setMediaStage("image");
      }
    });
    return () => sub.remove();
  }, [player]);

  /** Sincroniza el estado local con el estado real del player */
  useEffect(() => {
    const sub = player.addListener(
      "playingChange",
      ({ isPlaying: playing }) => {
        setIsPlaying(playing);
      },
    );
    return () => sub.remove();
  }, [player]);

  const togglePlayback = () => {
    if (player.playing) {
      player.pause();
    } else {
      player.play();
    }
  };

  return (
    <View style={styles.flex}>
      <View style={styles.headerBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={24} color={t.textPrimary} />
        </TouchableOpacity>
      </View>

      {isLoading && (
        <ActivityIndicator
          color={t.primary}
          size="large"
          style={{ marginTop: 40 }}
        />
      )}

      {!isLoading && errorMessage !== null && (
        <View style={styles.errorBanner}>
          <Ionicons name="alert-circle-outline" size={18} color={t.errorText} />
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      )}

      {!isLoading && errorMessage === null && exercise !== null && (
        <View style={styles.content}>
          <View style={styles.mediaContainer}>
            {mediaStage === "video" && videoSource !== null && (
              <>
                <VideoView
                  player={player}
                  style={styles.mediaFill}
                  nativeControls={false}
                  contentFit="cover"
                />
                <TouchableOpacity
                  style={styles.mediaTapOverlay}
                  activeOpacity={1}
                  onPress={togglePlayback}
                >
                  <View style={styles.playbackBadge}>
                    <Ionicons
                      name={isPlaying ? "pause" : "play"}
                      size={14}
                      color="#fff"
                    />
                  </View>
                </TouchableOpacity>
              </>
            )}

            {mediaStage === "image" && imageSource !== null && (
              <Image
                source={imageSource}
                style={styles.mediaFill}
                contentFit="cover"
                onError={() => setMediaStage("placeholder")}
              />
            )}

            {(mediaStage === "placeholder" ||
              (mediaStage === "image" && imageSource === null)) && (
              <View style={[styles.mediaFill, styles.placeholderCenter]}>
                <Ionicons
                  name="barbell-outline"
                  size={64}
                  color={t.textTertiary}
                />
              </View>
            )}
          </View>

          <View>
            <Text style={styles.exerciseName}>{exercise.name}</Text>
            <View style={styles.muscleGroupPill}>
              <Text style={styles.muscleGroupPillText}>
                {exercise.muscleGroup.name}
              </Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
