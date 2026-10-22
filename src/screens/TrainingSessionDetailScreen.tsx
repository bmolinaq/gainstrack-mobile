import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import BlurCard from "../components/ui/BlurCard";
import ExerciseThumbnail from "../components/ui/ExerciseThumbnail";
import { trainingSessionService } from "../services/trainingSessionService";
import { APIGainstrackTrainingSessionDetailResponse } from "../types/trainingSession.types";
import { APIGainstrackErrorResponse } from "../types/api.types";
import { useAppTheme } from "../hooks/useAppTheme";
import { ThemeColors } from "../theme";

const H_PADDING = 20;

/** Formatea una fecha al estilo "dd mon. yyyy" en español */
function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

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
      gap: 2,
    },
    backButtonText: {
      color: t.textPrimary,
      fontFamily: "Inter-Bold",
      fontSize: 15,
      letterSpacing: 0.3,
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
    scrollContent: {
      paddingHorizontal: H_PADDING,
      paddingBottom: 40,
      gap: 16,
    },
    infoCard: {
      borderRadius: 18,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.07)",
      overflow: "hidden",
    },
    infoCardBlur: {
      padding: 16,
      gap: 10,
    },
    infoRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    infoText: {
      color: t.textPrimary,
      fontFamily: "Inter-Bold",
      fontSize: 14,
      letterSpacing: 0.2,
    },
    notesCard: {
      borderRadius: 18,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.07)",
      overflow: "hidden",
    },
    notesCardBlur: {
      padding: 16,
    },
    notesCardHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 10,
    },
    notesCardLabel: {
      color: t.textSecondary,
      fontFamily: "Inter-Bold",
      fontSize: 11,
      letterSpacing: 1,
    },
    notesText: {
      color: t.textSecondary,
      fontSize: 14,
      lineHeight: 19,
    },
    emptyContainer: {
      marginTop: 24,
      alignItems: "center",
    },
    emptyText: {
      color: t.textTertiary,
      fontSize: 14,
      letterSpacing: 0.5,
      textAlign: "center",
    },
    exerciseCard: {
      borderRadius: 22,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.07)",
      overflow: "hidden",
    },
    exerciseCardBlur: {
      padding: 16,
    },
    exerciseHeaderRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 12,
    },
    exerciseHeaderInfo: {
      flex: 1,
      gap: 8,
    },
    exerciseName: {
      color: t.textPrimary,
      fontFamily: "Inter-Bold",
      fontSize: 17,
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
    },
    muscleGroupPillText: {
      color: t.textPrimary,
      fontSize: 11,
      fontFamily: "Inter-Bold",
      letterSpacing: 0.5,
    },
    exerciseOrderBadge: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: t.primaryMuted,
      borderColor: "rgba(170,255,0,0.25)",
      borderWidth: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    exerciseOrderBadgeText: {
      color: t.textPrimary,
      fontSize: 12,
      fontFamily: "Inter-Bold",
    },
    exerciseNotesRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 8,
      marginTop: 12,
    },
    exerciseNotesIcon: {
      marginTop: 1,
    },
    exerciseNotesText: {
      flex: 1,
      color: t.textSecondary,
      fontSize: 13,
      lineHeight: 18,
    },
    setsDivider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: t.divider,
      marginVertical: 14,
    },
    setsContainer: {
      gap: 10,
    },
    setCard: {
      borderRadius: 16,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.07)",
      overflow: "hidden",
    },
    setCardBlur: {
      padding: 12,
    },
    setHeaderRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 10,
    },
    setBadge: {
      width: 22,
      height: 22,
      borderRadius: 11,
      borderWidth: 1,
      borderColor: t.primaryBorder,
      alignItems: "center",
      justifyContent: "center",
    },
    setBadgeText: {
      color: t.primary,
      fontSize: 11,
      fontFamily: "Inter-Bold",
    },
    setLabel: {
      color: t.textSecondary,
      fontSize: 11,
      letterSpacing: 1.5,
      fontFamily: "Inter-Bold",
    },
    setInputsRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    setInputGroup: {
      flex: 1,
      gap: 4,
    },
    setInputLabel: {
      color: t.textTertiary,
      fontSize: 10,
      letterSpacing: 1,
    },
    setInputValue: {
      color: t.textPrimary,
      fontFamily: "Inter-Bold",
      fontSize: 17,
      paddingVertical: 4,
    },
    setInputDivider: {
      width: StyleSheet.hairlineWidth,
      backgroundColor: t.divider,
      marginHorizontal: 16,
      alignSelf: "stretch",
    },
    setNotesRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 6,
      marginTop: 10,
      paddingTop: 10,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: t.divider,
    },
    setNotesText: {
      flex: 1,
      color: t.textSecondary,
      fontSize: 12,
      lineHeight: 16,
    },
  });
}

export default function TrainingSessionDetailScreen({
  route,
  navigation,
}: any) {
  const t = useAppTheme();
  const styles = useMemo(() => getStyles(t), [t]);

  const { id } = route.params;

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [trainingSession, setTrainingSession] =
    useState<APIGainstrackTrainingSessionDetailResponse | null>(null);

  /** Carga el detalle de la sesión de entrenamiento seleccionada */
  useEffect(() => {
    const fetchSession = async () => {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const response = await trainingSessionService.findById(id);
        setTrainingSession(response);
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
    fetchSession();
  }, [id]);

  return (
    <View style={styles.flex}>
      <View style={styles.headerBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={20} color={t.textPrimary} />
          <Text style={styles.backButtonText}>Historial</Text>
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
          <Ionicons
            name="alert-circle-outline"
            size={18}
            color={t.errorText}
          />
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      )}

      {!isLoading && errorMessage === null && trainingSession !== null && (
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Session info */}
          <BlurCard style={{ borderRadius: 18 }} contentStyle={{ padding: 16, gap: 10 }}>
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={16} color={t.textTertiary} />
              <Text style={styles.infoText} numberOfLines={1}>
                {trainingSession.gym ? trainingSession.gym.name : "Sin gimnasio"}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={16} color={t.textTertiary} />
              <Text style={styles.infoText}>
                {formatDate(trainingSession.sessionDate)}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={16} color={t.textTertiary} />
              <Text style={styles.infoText}>{trainingSession.duration} min</Text>
            </View>
          </BlurCard>

          {/* Session notes */}
          <BlurCard style={{ borderRadius: 18 }}>
            <View style={styles.notesCardHeader}>
              <Ionicons name="document-text-outline" size={15} color={t.textTertiary} />
              <Text style={styles.notesCardLabel}>Notas de la sesión</Text>
            </View>
            <Text style={styles.notesText}>
              {trainingSession.notes ?? "Sin notas"}
            </Text>
          </BlurCard>

          {/* Exercises */}
          {trainingSession.exercises.length === 0 && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                Sin ejercicios registrados en esta sesión.
              </Text>
            </View>
          )}

          {trainingSession.exercises
            .slice()
            .sort((a, b) => a.orderIndex - b.orderIndex)
            .map((ex) => (
              <BlurCard key={ex.id} style={{ borderRadius: 22 }}>
                <TouchableOpacity
                  style={styles.exerciseHeaderRow}
                  activeOpacity={0.7}
                  onPress={() =>
                    navigation.navigate("ExerciseDetail", {
                      id: ex.exercise.id,
                    })
                  }
                >
                  <ExerciseThumbnail exerciseId={ex.exercise.id} />
                  <View style={styles.exerciseHeaderInfo}>
                    <Text style={styles.exerciseName} numberOfLines={2}>
                      {ex.exercise.name}
                    </Text>
                    <View style={styles.muscleGroupPill}>
                      <Text style={styles.muscleGroupPillText}>
                        {ex.exercise.muscleGroup.name}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.exerciseOrderBadge}>
                    <Text style={styles.exerciseOrderBadgeText}>
                      {ex.orderIndex}
                    </Text>
                  </View>
                </TouchableOpacity>

                {ex.notes !== null && ex.notes !== "" && (
                  <View style={styles.exerciseNotesRow}>
                    <Ionicons
                      name="create-outline"
                      size={13}
                      color={t.textTertiary}
                      style={styles.exerciseNotesIcon}
                    />
                    <Text style={styles.exerciseNotesText}>{ex.notes}</Text>
                  </View>
                )}

                <View style={styles.setsDivider} />

                <View style={styles.setsContainer}>
                  {ex.sets
                    .slice()
                    .sort((a, b) => a.setNumber - b.setNumber)
                    .map((set) => (
                      <BlurCard key={set.id} style={{ borderRadius: 16 }} contentStyle={{ padding: 12 }}>
                        <View style={styles.setHeaderRow}>
                          <View style={styles.setBadge}>
                            <Text style={styles.setBadgeText}>
                              {set.setNumber}
                            </Text>
                          </View>
                          <Text style={styles.setLabel}>
                            SERIE {set.setNumber}
                          </Text>
                        </View>

                        <View style={styles.setInputsRow}>
                          <View style={styles.setInputGroup}>
                            <Text style={styles.setInputLabel}>
                              PESO (KG)
                            </Text>
                            <Text style={styles.setInputValue}>
                              {set.weight ?? "—"}
                            </Text>
                          </View>
                          <View style={styles.setInputDivider} />
                          <View style={styles.setInputGroup}>
                            <Text style={styles.setInputLabel}>
                              REPETICIONES
                            </Text>
                            <Text style={styles.setInputValue}>
                              {set.reps ?? "—"}
                            </Text>
                          </View>
                        </View>

                        {set.notes !== null && set.notes !== "" && (
                          <View style={styles.setNotesRow}>
                            <Ionicons
                              name="document-text-outline"
                              size={12}
                              color={t.textTertiary}
                            />
                            <Text style={styles.setNotesText}>
                              {set.notes}
                            </Text>
                          </View>
                        )}
                      </BlurCard>
                    ))}
                </View>
              </BlurCard>
            ))}
        </ScrollView>
      )}
    </View>
  );
}
