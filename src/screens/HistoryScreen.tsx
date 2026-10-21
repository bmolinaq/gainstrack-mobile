import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import BlurCard from "../components/ui/BlurCard";
import axios from "axios";
import ActiveSessionFAB from "../components/ui/ActiveSessionFAB";
import { routineService } from "../services/routineService";
import { gymService } from "../services/gymService";
import { trainingSessionService } from "../services/trainingSessionService";
import { APIGainstrackRoutineSummaryResponse } from "../types/routine.types";
import { APIGainsTrackGymResponse } from "../types/gym.types";
import { APIGainstrackTrainingSessionSummaryResponse } from "../types/trainingSession.types";
import { APIGainstrackErrorResponse } from "../types/api.types";
import useHistoryFilterStore from "../store/useHistoryFilterStore";
import { useAppTheme } from "../hooks/useAppTheme";
import { ThemeColors, RADIUS } from "../theme";

const H_PADDING = 20;
const CARD_GAP = 16;

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getStyles(t: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: t.background,
    },
    listContent: {
      paddingHorizontal: H_PADDING,
      paddingTop: 8,
      gap: CARD_GAP,
      paddingBottom: 40,
    },
    // ── Header ──────────────────────────────────────────────
    headerRow: {
      flexDirection: "row",
      alignItems: "flex-end",
      justifyContent: "space-between",
      paddingHorizontal: H_PADDING,
      paddingTop: 56,
      paddingBottom: 24,
    },
    headerSubtitle: {
      color: t.textTertiary,
      fontSize: 11,
      letterSpacing: 3,
      marginBottom: 4,
    },
    headerTitle: {
      color: t.textPrimary,
      fontFamily: "Inter-Bold",
      fontSize: 36,
      letterSpacing: -0.5,
    },
    // ── Filters ─────────────────────────────────────────────
    filterLabel: {
      color: t.textTertiary,
      fontFamily: "Inter-Bold",
      fontSize: 11,
      letterSpacing: 1.5,
      marginBottom: 10,
    },
    chipScroll: {
      marginBottom: 20,
    },
    chipRow: {
      gap: 10,
      paddingRight: H_PADDING,
    },
    chip: {
      backgroundColor: "transparent",
      borderColor: t.surfaceBorder,
      borderWidth: 1,
      borderRadius: RADIUS.pill,
      paddingHorizontal: 16,
      paddingVertical: 10,
      maxWidth: 200,
    },
    chipSelected: {
      backgroundColor: t.primary,
      borderColor: t.primary,
    },
    chipText: {
      color: t.textSecondary,
      fontFamily: "Inter-Bold",
      fontSize: 13,
      letterSpacing: 0.2,
    },
    chipTextSelected: {
      color: t.primaryOnPrimary,
    },
    // ── Error ───────────────────────────────────────────────
    errorBanner: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      backgroundColor: t.errorBg,
      borderColor: t.errorBorder,
      borderWidth: 1,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
    },
    errorText: {
      flex: 1,
      color: t.errorText,
      fontSize: 14,
    },
    // ── Empty state ─────────────────────────────────────────
    emptyState: {
      alignItems: "center",
      gap: 8,
      marginTop: 64,
    },
    emptyTitle: {
      color: t.textTertiary,
      fontFamily: "Inter-Bold",
      fontSize: 16,
      marginTop: 12,
      textAlign: "center",
    },
    emptySubtitle: {
      color: t.textDisabled,
      fontSize: 13,
      textAlign: "center",
      paddingHorizontal: 20,
    },
    // ── Cards ───────────────────────────────────────────────
    card: {
      borderRadius: RADIUS.xl,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.07)",
      overflow: "hidden",
      backgroundColor: "transparent",
    },
    cardBlur: {
      padding: 18,
    },
    trainingSessionMeta: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 10,
    },
    trainingSessionDate: {
      color: "rgba(255,255,255,0.30)",
      fontSize: 11,
      letterSpacing: 0.5,
    },
    trainingSessionNotes: {
      color: t.textSecondary,
      fontSize: 13,
      lineHeight: 18,
    },
    // ── Bottom fade ─────────────────────────────────────────
    bottomFade: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      height: 72,
      pointerEvents: "none",
    },
  });
}

export default function HistoryScreen({ navigation }: any) {
  const t = useAppTheme();
  const styles = useMemo(() => getStyles(t), [t]);

  const [isLoadingFilters, setIsLoadingFilters] = useState(false);
  const [filtersErrorMessage, setFiltersErrorMessage] = useState<string | null>(null);
  const [routines, setRoutines] = useState<APIGainstrackRoutineSummaryResponse[]>([]);
  const [gyms, setGyms] = useState<APIGainsTrackGymResponse[]>([]);

  const {
    selectedRoutineId,
    selectedGymId,
    setSelectedRoutineId,
    setSelectedGymId,
  } = useHistoryFilterStore();

  const selectedRoutine = routines.find((r) => r.id === selectedRoutineId) ?? null;
  const selectedGym = gyms.find((g) => g.id === selectedGymId) ?? null;

  const routineScrollRef = useRef<ScrollView>(null);
  const gymScrollRef = useRef<ScrollView>(null);
  const routineOffsets = useRef<Record<number, number>>({});
  const gymOffsets = useRef<Record<number, number>>({});
  const listHeightRef = useRef(0);
  const contentHeightRef = useRef(0);
  const [isScrollable, setIsScrollable] = useState(false);

  const checkScrollable = () => {
    setIsScrollable(contentHeightRef.current > listHeightRef.current);
  };

  useEffect(() => {
    if (selectedRoutineId === null) return;
    const x = routineOffsets.current[selectedRoutineId];
    if (x !== undefined)
      routineScrollRef.current?.scrollTo({ x: Math.max(0, x - 20), animated: true });
  }, [selectedRoutineId, routines]);

  useEffect(() => {
    if (selectedGymId === null) return;
    const x = gymOffsets.current[selectedGymId];
    if (x !== undefined)
      gymScrollRef.current?.scrollTo({ x: Math.max(0, x - 20), animated: true });
  }, [selectedGymId, gyms]);

  const [isLoadingTrainingSessions, setIsLoadingSessions] = useState(false);
  const [trainingSessionsErrorMessage, setTrainingSessionsErrorMessage] =
    useState<string | null>(null);
  const [trainingSessions, setTrainingSessions] = useState<
    APIGainstrackTrainingSessionSummaryResponse[]
  >([]);

  useFocusEffect(
    useCallback(() => {
      fetchFilters();
    }, []),
  );

  const fetchFilters = async () => {
    setIsLoadingFilters(true);
    setFiltersErrorMessage(null);
    try {
      const [routinesResponse, gymsResponse] = await Promise.all([
        routineService.findAll(),
        gymService.findAll(),
      ]);
      setRoutines(routinesResponse);
      setGyms(gymsResponse);
      const {
        selectedRoutineId: currentRoutineId,
        selectedGymId: currentGymId,
        setSelectedRoutineId: setRoutineId,
        setSelectedGymId: setGymId,
      } = useHistoryFilterStore.getState();
      if (currentRoutineId === null && routinesResponse.length > 0)
        setRoutineId(routinesResponse[0].id);
      if (currentGymId === null && gymsResponse.length > 0)
        setGymId(gymsResponse[0].id);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const apiError = error.response?.data as APIGainstrackErrorResponse;
        setFiltersErrorMessage(apiError.message);
      } else {
        setFiltersErrorMessage("Error inesperado, intente nuevamente");
      }
    } finally {
      setIsLoadingFilters(false);
    }
  };

  useEffect(() => {
    if (selectedRoutineId === null || selectedGymId === null) {
      setTrainingSessions([]);
      return;
    }
    if (routines.length === 0 || gyms.length === 0) return;

    const fetchTrainingSessions = async () => {
      setIsLoadingSessions(true);
      setTrainingSessionsErrorMessage(null);
      try {
        const response = await trainingSessionService.findfindAllByRoutineAndGym(
          selectedRoutineId,
          selectedGymId,
        );
        setTrainingSessions(response);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const apiError = error.response?.data as APIGainstrackErrorResponse;
          setTrainingSessionsErrorMessage(apiError.message);
        } else {
          setTrainingSessionsErrorMessage("Error inesperado, intente nuevamente");
        }
      } finally {
        setIsLoadingSessions(false);
      }
    };
    fetchTrainingSessions();
  }, [selectedRoutineId, selectedGymId, routines, gyms]);

  const hasFilters = routines.length > 0 && gyms.length > 0;
  const isLoading = isLoadingFilters || isLoadingTrainingSessions;
  const errorMessage = filtersErrorMessage ?? trainingSessionsErrorMessage;

  return (
    <View style={styles.container}>
      {/* ── Header ── */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.headerSubtitle}>MIS SESIONES PASADAS</Text>
          <Text style={styles.headerTitle}>Historial</Text>
        </View>
      </View>

      <FlatList
        data={!isLoading && errorMessage === null && hasFilters ? trainingSessions : []}
        keyExtractor={(trainingSession) => trainingSession.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onLayout={(e) => {
          listHeightRef.current = e.nativeEvent.layout.height;
          checkScrollable();
        }}
        onContentSizeChange={(_w, h) => {
          contentHeightRef.current = h;
          checkScrollable();
        }}
        ListHeaderComponent={
          <>
            {isLoadingFilters && (
              <ActivityIndicator
                color={t.primary}
                size="large"
                style={{ marginTop: 24, marginBottom: 8 }}
              />
            )}

            {!isLoadingFilters && filtersErrorMessage !== null && (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle-outline" size={18} color={t.errorText} />
                <Text style={styles.errorText}>{filtersErrorMessage}</Text>
              </View>
            )}

            {!isLoadingFilters && filtersErrorMessage === null && !hasFilters && (
              <View style={styles.emptyState}>
                <Ionicons name="time-outline" size={48} color={t.textDisabled} />
                <Text style={styles.emptyTitle}>Sin datos aún</Text>
                <Text style={styles.emptySubtitle}>
                  Necesitas al menos una rutina y un gimnasio para ver el historial
                </Text>
              </View>
            )}

            {!isLoadingFilters && filtersErrorMessage === null && hasFilters && (
              <>
                <Text style={styles.filterLabel}>RUTINA</Text>
                <ScrollView
                  ref={routineScrollRef}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.chipRow}
                  style={styles.chipScroll}
                >
                  {routines.map((routine) => {
                    const isSelected = selectedRoutine?.id === routine.id;
                    return (
                      <TouchableOpacity
                        key={routine.id}
                        activeOpacity={0.8}
                        style={[styles.chip, isSelected && styles.chipSelected]}
                        onLayout={(e) => {
                          routineOffsets.current[routine.id] = e.nativeEvent.layout.x;
                        }}
                        onPress={() => setSelectedRoutineId(routine.id)}
                      >
                        <Text
                          style={[styles.chipText, isSelected && styles.chipTextSelected]}
                          numberOfLines={1}
                        >
                          {routine.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

                <Text style={styles.filterLabel}>GIMNASIO</Text>
                <ScrollView
                  ref={gymScrollRef}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.chipRow}
                  style={styles.chipScroll}
                >
                  {gyms.map((gym) => {
                    const isSelected = selectedGym?.id === gym.id;
                    return (
                      <TouchableOpacity
                        key={gym.id}
                        activeOpacity={0.8}
                        style={[styles.chip, isSelected && styles.chipSelected]}
                        onLayout={(e) => {
                          gymOffsets.current[gym.id] = e.nativeEvent.layout.x;
                        }}
                        onPress={() => setSelectedGymId(gym.id)}
                      >
                        <Text
                          style={[styles.chipText, isSelected && styles.chipTextSelected]}
                          numberOfLines={1}
                        >
                          {gym.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </>
            )}

            {!isLoadingFilters &&
              filtersErrorMessage === null &&
              hasFilters &&
              isLoadingTrainingSessions && (
                <ActivityIndicator
                  color={t.primary}
                  size="large"
                  style={{ marginTop: 24 }}
                />
              )}

            {!isLoadingFilters &&
              filtersErrorMessage === null &&
              hasFilters &&
              !isLoadingTrainingSessions &&
              trainingSessionsErrorMessage !== null && (
                <View style={styles.errorBanner}>
                  <Ionicons name="alert-circle-outline" size={18} color={t.errorText} />
                  <Text style={styles.errorText}>{trainingSessionsErrorMessage}</Text>
                </View>
              )}

            {!isLoadingFilters &&
              filtersErrorMessage === null &&
              hasFilters &&
              !isLoadingTrainingSessions &&
              trainingSessionsErrorMessage === null &&
              trainingSessions.length === 0 && (
                <View style={styles.emptyState}>
                  <Ionicons name="time-outline" size={48} color={t.textDisabled} />
                  <Text style={styles.emptyTitle}>Sin sesiones</Text>
                  <Text style={styles.emptySubtitle}>
                    No hay sesiones para esta rutina en este gimnasio
                  </Text>
                </View>
              )}
          </>
        }
        renderItem={({ item: trainingSession }) => (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() =>
              navigation.navigate("TrainingSessionDetail", { id: trainingSession.id })
            }
          >
            <BlurCard style={{ borderRadius: RADIUS.xl }} contentStyle={{ padding: 18 }}>
              <View style={styles.trainingSessionMeta}>
                <Text style={styles.trainingSessionDate}>
                  {formatDate(trainingSession.sessionDate)}
                </Text>
                <Text style={styles.trainingSessionDate}>
                  {trainingSession.duration} min
                </Text>
              </View>
              <Text style={styles.trainingSessionNotes} numberOfLines={3}>
                {trainingSession.notes ?? "Sin notas"}
              </Text>
            </BlurCard>
          </TouchableOpacity>
        )}
      />

      {isScrollable && (
        <LinearGradient
          colors={["transparent", t.background]}
          style={styles.bottomFade}
          pointerEvents="none"
        />
      )}

      <ActiveSessionFAB
        onPress={() => {
          navigation.navigate("Rutinas", { screen: "ActiveTrainingSession" });
        }}
      />
    </View>
  );
}
