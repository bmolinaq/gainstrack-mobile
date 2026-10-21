import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import BlurCard from "../components/ui/BlurCard";
import ScreenHeader from "../components/ui/ScreenHeader";
import { trainingSessionService } from "../services/trainingSessionService";
import useActiveTrainingSessionStore from "../store/useActiveTrainingSessionStore";
import { APIGainstrackErrorResponse } from "../types/api.types";
import { useAppTheme } from "../hooks/useAppTheme";
import { ThemeColors } from "../theme";

const H_PADDING = 20;

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
    scrollContent: {
      paddingHorizontal: H_PADDING,
      paddingBottom: 40,
      gap: 16,
    },
    titleSection: {
      marginBottom: 8,
    },
    statsRow: {
      flexDirection: "row",
      gap: 10,
    },
    statCard: {
      flex: 1,
      alignItems: "center",
      gap: 6,
      borderRadius: 18,
    },
    statValue: {
      color: t.textPrimary,
      fontFamily: "Inter-Bold",
      fontSize: 28,
      letterSpacing: 0.5,
    },
    statLabel: {
      color: t.textTertiary,
      fontFamily: "Inter-Bold",
      fontSize: 10,
      letterSpacing: 1.5,
    },
    notesCard: {
      borderRadius: 18,
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
    notesInput: {
      color: t.textPrimary,
      fontSize: 14,
      lineHeight: 19,
      minHeight: 40,
      textAlignVertical: "top",
    },
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
    confirmButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      backgroundColor: t.primary,
      borderRadius: 16,
      paddingVertical: 18,
      marginTop: 8,
    },
    confirmButtonDisabled: {
      opacity: 0.6,
    },
    confirmButtonText: {
      color: t.primaryOnPrimary,
      fontFamily: "Inter-Bold",
      fontSize: 16,
      letterSpacing: 0.3,
    },
  });
}

export default function TrainingSessionSummaryScreen({ navigation }: any) {
  const t = useAppTheme();
  const styles = useMemo(() => getStyles(t), [t]);

  const {
    routineId,
    gymId,
    activeTrainingSession,
    startTimestamp,
    completedSetIds,
    clearTrainingSession,
  } = useActiveTrainingSessionStore();

  const { duration, completedExercises, totalSets } = useMemo(() => {
    const duration = Math.max(
      1,
      Math.round((Date.now() - startTimestamp!) / 60000),
    );
    const completedExercises = (activeTrainingSession?.exercises ?? []).filter(
      (ex) => ex.sets.some((set) => completedSetIds.has(set.id)),
    );
    const totalSets = completedExercises.reduce(
      (acc, ex) =>
        acc + ex.sets.filter((set) => completedSetIds.has(set.id)).length,
      0,
    );
    return { duration, completedExercises, totalSets };
  }, []);

  const [notes, setNotes] = useState(activeTrainingSession?.notes ?? "");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleConfirm = async () => {
    if (activeTrainingSession === null || routineId === null || gymId === null) {
      setErrorMessage("Hubo un problema al momento de finalizar la sesión.");
      return;
    }
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await trainingSessionService.save({
        routineId,
        gymId,
        notes: notes || null,
        duration,
        exercises: completedExercises.map((ex) => ({
          exerciseId: ex.exercise.id,
          orderIndex: ex.orderIndex,
          notes: ex.notes ?? "",
          sets: ex.sets
            .filter((set) => completedSetIds.has(set.id))
            .map((set) => ({
              setNumber: set.setNumber,
              weight: set.weight,
              reps: set.reps,
              notes: set.notes,
            })),
        })),
      });
      clearTrainingSession();
      navigation.reset({
        index: 0,
        routes: [{ name: "Routines" }],
      });
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

  if (activeTrainingSession === null) return null;

  return (
    <View style={styles.flex}>
      <View style={styles.headerBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={20} color={t.textPrimary} />
          <Text style={styles.backButtonText}>Sesión</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <ScreenHeader title="Resumen" style={styles.titleSection} />

        <View style={styles.statsRow}>
          <BlurCard style={{ flex: 1, borderRadius: 18 }} contentStyle={{ alignItems: "center", gap: 6 }}>
            <Ionicons name="time-outline" size={22} color={t.primary} />
            <Text style={styles.statValue}>{duration}</Text>
            <Text style={styles.statLabel}>MIN</Text>
          </BlurCard>
          <BlurCard style={{ flex: 1, borderRadius: 18 }} contentStyle={{ alignItems: "center", gap: 6 }}>
            <Ionicons name="barbell-outline" size={22} color={t.primary} />
            <Text style={styles.statValue}>{completedExercises.length}</Text>
            <Text style={styles.statLabel}>EJERCICIOS</Text>
          </BlurCard>
          <BlurCard style={{ flex: 1, borderRadius: 18 }} contentStyle={{ alignItems: "center", gap: 6 }}>
            <Ionicons
              name="checkmark-circle-outline"
              size={22}
              color={t.primary}
            />
            <Text style={styles.statValue}>{totalSets}</Text>
            <Text style={styles.statLabel}>SERIES</Text>
          </BlurCard>
        </View>

        <BlurCard style={{ borderRadius: 18 }}>
          <View style={styles.notesCardHeader}>
            <Ionicons
              name="document-text-outline"
              size={15}
              color="rgba(255,255,255,0.4)"
            />
            <Text style={styles.notesCardLabel}>Notas de la sesión</Text>
          </View>
          <TextInput
            value={notes}
            placeholder="Sin notas"
            placeholderTextColor="rgba(255,255,255,0.3)"
            style={styles.notesInput}
            multiline
            onChangeText={setNotes}
          />
        </BlurCard>

        {errorMessage !== null && (
          <View style={styles.errorBanner}>
            <Ionicons
              name="alert-circle-outline"
              size={18}
              color={t.errorText}
            />
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.confirmButton,
            isLoading && styles.confirmButtonDisabled,
          ]}
          activeOpacity={0.8}
          onPress={handleConfirm}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={t.primaryOnPrimary} size="small" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={18} color={t.primaryOnPrimary} />
              <Text style={styles.confirmButtonText}>Confirmar sesión</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
