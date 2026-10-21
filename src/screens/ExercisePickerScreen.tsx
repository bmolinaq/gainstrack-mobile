import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ExerciseThumbnail from "../components/ui/ExerciseThumbnail";
import { exerciseService } from "../services/exerciseService";
import { APIGainsTrackExerciseResponse } from "../types/exercise.types";
import axios from "axios";
import { APIGainstrackErrorResponse } from "../types/api.types";
import useExercisePickerStore from "../store/useExercisePickerStore";
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
      justifyContent: "space-between",
      paddingHorizontal: H_PADDING,
      paddingBottom: 16,
    },
    cancelButton: {
      backgroundColor: t.divider,
      borderWidth: 1,
      borderColor: t.surfaceBorder,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    cancelButtonText: {
      color: t.textSecondary,
      fontFamily: "Inter-Bold",
      fontSize: 13,
      letterSpacing: 0.2,
    },
    headerBarTitle: {
      position: "absolute",
      left: 0,
      right: 0,
      color: t.textPrimary,
      fontFamily: "Inter-Bold",
      fontSize: 16,
      letterSpacing: 0.3,
      textAlign: "center",
    },
    searchRow: {
      paddingHorizontal: H_PADDING,
      marginBottom: 16,
    },
    searchInputContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      backgroundColor: t.surface,
      borderColor: t.surfaceBorder,
      borderWidth: 1,
      borderRadius: 14,
      paddingHorizontal: 14,
      paddingVertical: 12,
    },
    searchInput: {
      flex: 1,
      color: t.textPrimary,
      fontSize: 15,
    },
    loadingIndicator: {
      marginTop: 60,
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
    listContent: {
      paddingHorizontal: H_PADDING,
      paddingBottom: 16,
      gap: 10,
    },
    emptyContainer: {
      marginTop: 60,
      alignItems: "center",
      gap: 14,
    },
    emptyText: {
      color: t.textTertiary,
      fontSize: 14,
      letterSpacing: 0.5,
    },
    exerciseCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      backgroundColor: t.surface,
      borderColor: t.surfaceBorder,
      borderWidth: 1,
      borderRadius: 16,
      padding: 14,
    },
    exerciseCardSelected: {
      backgroundColor: t.primaryMuted,
      borderColor: t.primaryBorder,
    },
    exerciseInfo: {
      flex: 1,
      gap: 8,
    },
    exerciseName: {
      color: t.textPrimary,
      fontFamily: "Inter-Bold",
      fontSize: 15,
      letterSpacing: 0.2,
    },
    exerciseNameSelected: {
      color: t.textPrimary,
    },
    exerciseTagsRow: {
      flexDirection: "row",
      gap: 8,
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
    muscleGroupPillSelected: {
      backgroundColor: "rgba(170,255,0,0.20)",
      borderColor: "rgba(170,255,0,0.60)",
    },
    muscleGroupPillText: {
      color: t.textPrimary,
      fontSize: 11,
      fontFamily: "Inter-Bold",
      letterSpacing: 0.5,
    },
    predefinedPill: {
      alignSelf: "flex-start",
      backgroundColor: t.divider,
      borderColor: t.surfaceBorder,
      borderWidth: 1,
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 4,
    },
    predefinedPillText: {
      color: t.textSecondary,
      fontSize: 11,
      letterSpacing: 0.5,
    },
    selectionCircle: {
      width: 26,
      height: 26,
      borderRadius: 13,
      borderWidth: 1.5,
      borderColor: t.textDisabled,
      alignItems: "center",
      justifyContent: "center",
    },
    selectionCircleSelected: {
      backgroundColor: t.primary,
      borderColor: t.primary,
    },
    footer: {
      paddingHorizontal: H_PADDING,
      paddingVertical: 16,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: t.divider,
    },
    confirmButton: {
      backgroundColor: t.primary,
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: "center",
    },
    confirmButtonDisabled: {
      backgroundColor: t.surfaceElevated,
    },
    confirmButtonText: {
      color: t.primaryOnPrimary,
      fontFamily: "Inter-Bold",
      fontSize: 16,
      letterSpacing: 0.5,
    },
    confirmButtonTextDisabled: {
      color: t.textTertiary,
    },
  });
}

export default function ExercisePickerScreen({ route, navigation }: any) {
  const t = useAppTheme();
  const styles = useMemo(() => getStyles(t), [t]);

  const { setPickedExercise } = useExercisePickerStore();

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [exercises, setExercises] = useState<APIGainsTrackExerciseResponse[]>(
    [],
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedExercise, setSelectedExercise] =
    useState<APIGainsTrackExerciseResponse | null>(null);

  useEffect(() => {
    console.log("INICIO VISTA DE EJERCICIOS");

    const fetchExercises = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const response = await exerciseService.findAll();
        setExercises(response);
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

    fetchExercises();
  }, []);

  const handleAddExercise = async () => {
    console.log("INICIO EVENTO PARA AGREGAR EJERCICIO DE FORMA LOCAL");

    setIsLoading(true);
    setErrorMessage(null);

    if (selectedExercise == null) {
      setErrorMessage("Debe seleccionar un ejercicio");
      return;
    }

    setPickedExercise(selectedExercise);
    setIsLoading(false);
    navigation.goBack();
  };

  const filteredExercises = useMemo(() => {
    if (!searchQuery.trim()) return exercises;
    const q = searchQuery.trim().toLowerCase();
    return exercises.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.muscleGroup.name.toLowerCase().includes(q),
    );
  }, [exercises, searchQuery]);

  return (
    <View style={styles.flex}>
      <View style={styles.headerBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
          style={styles.cancelButton}
        >
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
        <Text style={styles.headerBarTitle} numberOfLines={1}>
          Agregar ejercicio
        </Text>
      </View>

      <View style={styles.searchRow}>
        <View style={styles.searchInputContainer}>
          <Ionicons
            name="search-outline"
            size={18}
            color={t.textTertiary}
          />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Buscar ejercicio..."
            placeholderTextColor={t.textTertiary}
            style={styles.searchInput}
            autoCapitalize="none"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery("")}
              activeOpacity={0.7}
            >
              <Ionicons
                name="close-circle"
                size={18}
                color={t.textTertiary}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {isLoading && (
        <ActivityIndicator
          color={t.primary}
          size="large"
          style={styles.loadingIndicator}
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

      {!isLoading && errorMessage === null && (
        <FlatList
          data={filteredExercises}
          keyExtractor={(exercise) => exercise.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons
                name="barbell-outline"
                size={40}
                color={t.textDisabled}
              />
              <Text style={styles.emptyText}>No se encontraron ejercicios</Text>
            </View>
          }
          renderItem={({ item: exercise }) => {
            const isSelected = selectedExercise?.id === exercise.id;
            return (
              <TouchableOpacity
                onPress={() =>
                  setSelectedExercise(isSelected ? null : exercise)
                }
                style={[
                  styles.exerciseCard,
                  isSelected && styles.exerciseCardSelected,
                ]}
                activeOpacity={0.7}
              >
                <ExerciseThumbnail exerciseId={exercise.id} />
                <View style={styles.exerciseInfo}>
                  <Text
                    style={[
                      styles.exerciseName,
                      isSelected && styles.exerciseNameSelected,
                    ]}
                    numberOfLines={2}
                  >
                    {exercise.name}
                  </Text>
                  <View style={styles.exerciseTagsRow}>
                    <View
                      style={[
                        styles.muscleGroupPill,
                        isSelected && styles.muscleGroupPillSelected,
                      ]}
                    >
                      <Text style={styles.muscleGroupPillText}>
                        {exercise.muscleGroup.name}
                      </Text>
                    </View>
                    {exercise.isPredefined && (
                      <View style={styles.predefinedPill}>
                        <Text style={styles.predefinedPillText}>
                          Predefinido
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
                <View
                  style={[
                    styles.selectionCircle,
                    isSelected && styles.selectionCircleSelected,
                  ]}
                >
                  {isSelected && (
                    <Ionicons name="checkmark" size={16} color={t.primaryOnPrimary} />
                  )}
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.confirmButton,
            selectedExercise === null && styles.confirmButtonDisabled,
          ]}
          activeOpacity={0.8}
          disabled={selectedExercise === null}
          onPress={() => handleAddExercise()}
        >
          <Text
            style={[
              styles.confirmButtonText,
              selectedExercise === null && styles.confirmButtonTextDisabled,
            ]}
          >
            Agregar ejercicio
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
