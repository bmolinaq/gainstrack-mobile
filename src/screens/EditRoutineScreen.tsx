import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  findNodeHandle,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  UIManager,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { routineService } from "../services/routineService";
import {
  APIGainsTrackRoutineDetailResponse,
  RoutineExercise,
} from "../types/routine.types";
import axios from "axios";
import { APIGainstrackErrorResponse } from "../types/api.types";
import { useFocusEffect } from "@react-navigation/native";
import useExercisePickerStore from "../store/useExercisePickerStore";
import Toast from "react-native-toast-message";
import BlurCard from "../components/ui/BlurCard";
import PopoverMenu from "../components/ui/PopoverMenu";
import ExerciseThumbnail from "../components/ui/ExerciseThumbnail";
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
      paddingTop: 16,
      paddingBottom: 16,
    },
    headerIconButton: {
      width: 36,
      height: 36,
      borderRadius: 12,
      backgroundColor: t.divider,
      alignItems: "center",
      justifyContent: "center",
    },
    headerCancelButton: {
      paddingHorizontal: 14,
      height: 36,
      borderRadius: 12,
      backgroundColor: t.divider,
      alignItems: "center",
      justifyContent: "center",
    },
    headerCancelButtonText: {
      color: t.textSecondary,
      fontFamily: "Inter-Bold",
      fontSize: 14,
      letterSpacing: 0.3,
    },
    headerBarTitle: {
      flex: 1,
      color: t.textPrimary,
      fontFamily: "Inter-Bold",
      fontSize: 16,
      letterSpacing: 0.3,
      textAlign: "center",
      marginHorizontal: 12,
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
    emptyContainer: {
      marginTop: 40,
      alignItems: "center",
    },
    emptyText: {
      color: t.textTertiary,
      fontSize: 14,
      letterSpacing: 0.5,
    },
    scrollContent: {
      paddingHorizontal: H_PADDING,
      paddingBottom: 40,
      gap: 16,
    },
    titleSection: {
      marginBottom: 4,
    },
    routineTitle: {
      color: t.textPrimary,
      fontFamily: "Inter-Bold",
      fontSize: 28,
      letterSpacing: 0.3,
      padding: 0,
    },
    routineSubtitle: {
      color: t.textTertiary,
      fontSize: 11,
      letterSpacing: 3,
      marginTop: 6,
    },
    notesCard: {
      borderRadius: 18,
      // layout delegado a BlurCard
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
    exerciseCard: {
      borderRadius: 22,
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
    exerciseOptionsButton: {
      padding: 4,
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
      alignItems: "center",
      gap: 8,
      marginTop: 12,
    },
    exerciseNotesIcon: {
      marginTop: 1,
    },
    exerciseNotesInput: {
      flex: 1,
      color: t.textSecondary,
      fontSize: 13,
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
      padding: 12,
    },
    setHeaderRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 10,
    },
    setHeaderInfo: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    deleteSetButton: {
      width: 26,
      height: 26,
      borderRadius: 8,
      backgroundColor: "rgba(255,75,75,0.08)",
      alignItems: "center",
      justifyContent: "center",
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
    setInput: {
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
      alignItems: "center",
      gap: 6,
      marginTop: 10,
      paddingTop: 10,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: t.divider,
    },
    setNotesInput: {
      flex: 1,
      color: t.textSecondary,
      fontSize: 12,
    },
    addSetButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      backgroundColor: t.primaryMuted,
      borderColor: t.primaryBorder,
      borderWidth: 1,
      borderRadius: 12,
      paddingVertical: 10,
      marginTop: 10,
    },
    addSetButtonText: {
      color: t.textPrimary,
      fontFamily: "Inter-Bold",
      fontSize: 13,
      letterSpacing: 0.5,
    },
    addExerciseButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      backgroundColor: t.primaryMuted,
      borderColor: t.primaryBorder,
      borderWidth: 1,
      borderRadius: 14,
      paddingVertical: 16,
      marginTop: 4,
    },
    addExerciseButtonText: {
      color: t.textPrimary,
      fontFamily: "Inter-Bold",
      fontSize: 15,
      letterSpacing: 0.5,
    },
    keyboardToolbar: {
      flexDirection: "row",
      justifyContent: "flex-end",
      alignItems: "center",
      backgroundColor: t.background,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: t.divider,
      paddingHorizontal: H_PADDING,
      paddingVertical: 8,
    },
    keyboardToolbarButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    keyboardToolbarButtonText: {
      color: t.primary,
      fontFamily: "Inter-Bold",
      fontSize: 14,
      letterSpacing: 0.3,
    },
  });
}

export default function EditRoutineScreen({ route, navigation }: any) {
  const t = useAppTheme();
  const styles = useMemo(() => getStyles(t), [t]);

  const { routineId } = route.params;
  const { pickedExercise, clearPickedExercise } = useExercisePickerStore();

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [originalRoutine, setOriginalRoutine] =
    useState<APIGainsTrackRoutineDetailResponse | null>(null);
  const [routine, setRoutine] =
    useState<APIGainsTrackRoutineDetailResponse | null>(null);
  const [openExerciseMenuId, setOpenExerciseMenuId] = useState<number | null>(
    null,
  );
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    console.log("INICIO DE VISTA EDITAR RUTINA");
    fetchRoutineById();
  }, []);

  const handleInputFocus = (event: any) => {
    const inputHandle = findNodeHandle(event.target);
    const scrollHandle = findNodeHandle(scrollViewRef.current);

    if (inputHandle == null || scrollHandle == null) return;

    setTimeout(() => {
      UIManager.measureLayout(
        inputHandle,
        scrollHandle,
        () => {},
        (_left: number, top: number) => {
          scrollViewRef.current?.scrollTo({
            y: Math.max(top - 120, 0),
            animated: true,
          });
        },
      );
    }, 120);
  };

  useFocusEffect(
    useCallback(() => {
      if (pickedExercise !== null) {
        console.log("CARGANDO EJERCICIO SELECCIONADO DE FORMA LOCAL");
        setRoutine((prev) => ({
          ...prev!,
          exercises: [
            ...prev!.exercises,
            {
              id: -Date.now(),
              orderIndex: prev!.exercises.length + 1,
              notes: "",
              exercise: pickedExercise,
              sets: [],
            },
          ],
        }));
        clearPickedExercise();
      }
    }, [pickedExercise]),
  );

  const fetchRoutineById = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await routineService.findById(routineId);
      setOriginalRoutine(response);
      setRoutine(response);
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

  const handleUpdateRoutineName = (name: string) => {
    if (routine === null) return;

    setRoutine({
      ...routine,
      name: name,
    });
  };

  const handleUpdateRoutineNotes = (notes: string) => {
    if (routine === null) return;

    setRoutine({
      ...routine,
      notes: notes,
    });
  };

  const handleUpdateSetWeight = (
    exerciseId: number,
    setId: number,
    newWeight: string,
  ) => {
    if (routine === null) return;

    setRoutine({
      ...routine,
      exercises: routine.exercises.map((exercise) =>
        exercise.id !== exerciseId
          ? exercise
          : {
              ...exercise,
              sets: exercise.sets.map((set) =>
                set.id !== setId
                  ? set
                  : {
                      ...set,
                      weight: newWeight === "" ? null : parseFloat(newWeight),
                    },
              ),
            },
      ),
    });
  };

  const handleUpdateSetReps = (
    exerciseId: number,
    setId: number,
    newReps: string,
  ) => {
    if (routine === null) return;

    setRoutine({
      ...routine,
      exercises: routine.exercises.map((exercise) =>
        exercise.id !== exerciseId
          ? exercise
          : {
              ...exercise,
              sets: exercise.sets.map((set) =>
                set.id !== setId
                  ? set
                  : {
                      ...set,
                      reps: newReps === "" ? null : parseFloat(newReps),
                    },
              ),
            },
      ),
    });
  };

  const handleDeleteRoutineExercise = async () => {
    console.log(
      `INICIO EVENTO ELIMINAR EJERCICIO DE RUTINA CON ID: ${openExerciseMenuId} DE FORMA LOCAL`,
    );

    setIsLoading(true);

    setRoutine((prev) => ({
      ...prev!,
      exercises: prev!.exercises
        .filter((exercise) => exercise.id !== openExerciseMenuId)
        .map((exercise, index) => ({
          ...exercise,
          orderIndex: index + 1,
        })),
    }));
    setIsLoading(false);
  };

  const handleDeleteSet = (routineExerciseId: number, setId: number) => {
    console.log("INICIO EVENTO ELIMINAR SET DE EJERCICIO");

    setIsLoading(true);
    setRoutine((prev) => ({
      ...prev!,
      exercises: prev!.exercises.map((exercise) =>
        exercise.id != routineExerciseId
          ? exercise
          : {
              ...exercise,
              sets: exercise.sets
                .filter((set) => set.id !== setId)
                .map((set, index) => ({ ...set, setNumber: index + 1 })),
            },
      ),
    }));
    setIsLoading(false);
  };

  const handleAddSet = async (routineExerciseId: number) => {
    console.log("INICIO EVENTO AÑADIR SET A EJERCICIO");

    setIsLoading(true);

    setRoutine((prev) => ({
      ...prev!,
      exercises: prev!.exercises.map((exercise) =>
        exercise.id !== routineExerciseId
          ? exercise
          : {
              ...exercise,
              sets: [
                ...exercise.sets,
                {
                  id: -Date.now(),
                  setNumber: exercise.sets.length + 1,
                  weight: null,
                  reps: null,
                  notes: "",
                },
              ],
            },
      ),
    }));
    setIsLoading(false);
  };

  const handleSaveRoutine = async () => {
    console.log("INICIO EVENTO GUARDAR CAMBIOS RUTINA");

    setIsLoading(true);
    setErrorMessage(null);

    if (routine == null || originalRoutine == null) {
      setErrorMessage("Hubo un problema al momento de actualizar la rutina.");
      return;
    }

    // Se identifica si cambio el nombre o la nota general de la rutina
    if (
      originalRoutine.name !== routine.name ||
      originalRoutine.notes !== routine.notes
    ) {
      await routineService.update(routineId, {
        name: routine.name,
        notes: routine.notes,
      });
    }

    // Ejercicios eliminados
    const deletedExercises = originalRoutine!.exercises.filter(
      (original) =>
        !routine?.exercises.some((current) => current.id === original.id),
    );

    // Ejercicios nuevos
    const newExercises = routine?.exercises.filter(
      (exercise) => exercise.id < 0,
    );

    // Se eliminan ejercicios de la rutina desde el backend
    await Promise.all(
      deletedExercises.map((exercise) =>
        routineService.deleteExerciseById(routineId, exercise.id),
      ),
    );

    // Se agregan ejercicios nuevos a la rutina desde el backend
    const createdExercises = await Promise.all(
      newExercises.map((routineExercise) =>
        routineService.saveExercise(routineId, {
          exerciseId: routineExercise.exercise.id,
          orderIndex: routineExercise.orderIndex,
        }),
      ),
    );

    // Se agregan set a ejercicios recien creados desde el backend
    await Promise.all(
      createdExercises.flatMap((createdExercise, index) =>
        newExercises[index].sets.map((set) =>
          routineService.saveSet(routineId, createdExercise.id, {
            setNumber: set.setNumber,
            weight: set.weight,
            reps: set.reps,
            notes: set.notes,
          }),
        ),
      ),
    );

    // Se modifican set de ejercicios existentes dentro de la rutina
    await Promise.all(
      routine.exercises
        .filter((exercise) => exercise.id > 0)
        .flatMap((exercise) => {
          const originalExercise = originalRoutine.exercises.find(
            (original) => original.id == exercise.id,
          );

          // Sets eliminados
          const deletedSets =
            originalExercise?.sets.filter(
              (original) =>
                !exercise.sets.some((current) => current.id == original.id),
            ) ?? [];

          // Sets nuevos
          const newSets = exercise.sets.filter((set) => set.id < 0);

          // Sets modificados
          const modifiedSets = exercise.sets.filter((set) => {
            if (set.id < 0) return false;

            const originalSet = originalExercise?.sets.find(
              (original) => original.id == set.id,
            );

            return (
              set.reps !== originalSet?.reps ||
              set.weight !== originalSet?.weight ||
              set.notes !== originalSet?.notes
            );
          });

          return [
            ...deletedSets?.map((set) =>
              routineService.deleteSetById(routineId, exercise.id, set.id),
            ),
            ...newSets.map((set) =>
              routineService.saveSet(routineId, exercise.id, set),
            ),
            ...modifiedSets.map((set) =>
              routineService.updateExerciseSet(routineId, exercise.id, set),
            ),
          ];
        }),
    );

    navigation.goBack();
  };

  return (
    <View style={styles.flex}>
      <View style={styles.headerBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerCancelButton}
          activeOpacity={0.7}
        >
          <Text style={styles.headerCancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
        <Text style={styles.headerBarTitle} numberOfLines={1}>
          Editar rutina
        </Text>
        <TouchableOpacity
          onPress={handleSaveRoutine}
          style={styles.headerIconButton}
          activeOpacity={0.7}
        >
          <Ionicons name="checkmark" size={24} color={t.primary} />
        </TouchableOpacity>
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

      {!isLoading && errorMessage === null && routine && (
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ScrollView
              ref={scrollViewRef}
              style={styles.flex}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.titleSection}>
                <TextInput
                  value={routine.name}
                  onChangeText={(newName) => handleUpdateRoutineName(newName)}
                  placeholder="Nombre de la rutina"
                  placeholderTextColor={t.textTertiary}
                  style={styles.routineTitle}
                />
              </View>

              <BlurCard style={{ borderRadius: 18 }}>
                <View style={styles.notesCardHeader}>
                  <Ionicons
                    name="document-text-outline"
                    size={15}
                    color={t.textTertiary}
                  />
                  <Text style={styles.notesCardLabel}>Notas de la rutina</Text>
                </View>
                <TextInput
                  value={routine.notes ?? ""}
                  onChangeText={(newNotes) =>
                    handleUpdateRoutineNotes(newNotes)
                  }
                  placeholder="Sin notas"
                  placeholderTextColor={t.textTertiary}
                  style={styles.notesInput}
                  multiline
                />
              </BlurCard>

              {routine.exercises.length === 0 && (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>
                    Esta rutina no tiene ejercicios aún
                  </Text>
                </View>
              )}

              {routine.exercises.map((routineExercise) => (
                <BlurCard
                  key={routineExercise.id}
                  style={{ borderRadius: 22 }}
                >
                  <View style={styles.exerciseHeaderRow}>
                    <ExerciseThumbnail exerciseId={routineExercise.exercise.id} />
                    <View style={styles.exerciseHeaderInfo}>
                      <Text style={styles.exerciseName} numberOfLines={2}>
                        {routineExercise.exercise.name}
                      </Text>
                      <View style={styles.muscleGroupPill}>
                        <Text style={styles.muscleGroupPillText}>
                          {routineExercise.exercise.muscleGroup.name}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.exerciseOrderBadge}>
                      <Text style={styles.exerciseOrderBadgeText}>
                        {routineExercise.orderIndex}
                      </Text>
                    </View>
                    <PopoverMenu
                      isVisible={openExerciseMenuId === routineExercise.id}
                      onRequestClose={() => setOpenExerciseMenuId(null)}
                      from={(sourceRef, showPopover) => (
                        <TouchableOpacity
                          ref={sourceRef as any}
                          onPress={() =>
                            setOpenExerciseMenuId(routineExercise.id)
                          }
                          style={styles.exerciseOptionsButton}
                          activeOpacity={0.6}
                        >
                          <Ionicons
                            name="ellipsis-vertical"
                            size={18}
                            color={t.textTertiary}
                          />
                        </TouchableOpacity>
                      )}
                    >
                      <PopoverMenu.Item
                        icon="trash-outline"
                        label="Eliminar"
                        danger
                        onPress={() => handleDeleteRoutineExercise()}
                      />
                    </PopoverMenu>
                  </View>

                  <View style={styles.exerciseNotesRow}>
                    <Ionicons
                      name="create-outline"
                      size={13}
                      color={t.textTertiary}
                      style={styles.exerciseNotesIcon}
                    />
                    <TextInput
                      value={routineExercise.notes}
                      placeholder="Notas del ejercicio"
                      placeholderTextColor={t.textTertiary}
                      style={styles.exerciseNotesInput}
                      onFocus={handleInputFocus}
                    />
                  </View>

                  <View style={styles.setsDivider} />

                  <View style={styles.setsContainer}>
                    {routineExercise.sets.map((routineExerciseSet) => (
                      <BlurCard
                        key={routineExerciseSet.id}
                        style={{ borderRadius: 16 }}
                        contentStyle={{ padding: 12 }}
                      >
                        <View style={styles.setHeaderRow}>
                          <View style={styles.setHeaderInfo}>
                            <View style={styles.setBadge}>
                              <Text style={styles.setBadgeText}>
                                {routineExerciseSet.setNumber}
                              </Text>
                            </View>
                            <Text style={styles.setLabel}>
                              SERIE {routineExerciseSet.setNumber}
                            </Text>
                          </View>
                          <TouchableOpacity
                            style={styles.deleteSetButton}
                            activeOpacity={0.7}
                            onPress={() =>
                              handleDeleteSet(
                                routineExercise.id,
                                routineExerciseSet.id,
                              )
                            }
                          >
                            <Ionicons
                              name="trash-outline"
                              size={15}
                              color="rgba(255,75,75,0.9)"
                            />
                          </TouchableOpacity>
                        </View>

                        <View style={styles.setInputsRow}>
                          <View style={styles.setInputGroup}>
                            <Text style={styles.setInputLabel}>PESO (KG)</Text>
                            <TextInput
                              value={
                                routineExerciseSet.weight?.toString() ?? ""
                              }
                              onChangeText={(newWeight) =>
                                handleUpdateSetWeight(
                                  routineExercise.id,
                                  routineExerciseSet.id,
                                  newWeight,
                                )
                              }
                              keyboardType="decimal-pad"
                              placeholderTextColor={t.textTertiary}
                              style={styles.setInput}
                              onFocus={handleInputFocus}
                            />
                          </View>
                          <View style={styles.setInputDivider} />
                          <View style={styles.setInputGroup}>
                            <Text style={styles.setInputLabel}>
                              REPETICIONES
                            </Text>
                            <TextInput
                              value={routineExerciseSet.reps?.toString() ?? ""}
                              onChangeText={(newReps) =>
                                handleUpdateSetReps(
                                  routineExercise.id,
                                  routineExerciseSet.id,
                                  newReps,
                                )
                              }
                              keyboardType="number-pad"
                              placeholderTextColor={t.textTertiary}
                              style={styles.setInput}
                              onFocus={handleInputFocus}
                            />
                          </View>
                        </View>

                        <View style={styles.setNotesRow}>
                          <Ionicons
                            name="document-text-outline"
                            size={12}
                            color={t.textTertiary}
                          />
                          <TextInput
                            value={routineExerciseSet.notes ?? ""}
                            placeholder="Notas de la serie"
                            placeholderTextColor={t.textTertiary}
                            style={styles.setNotesInput}
                            onFocus={handleInputFocus}
                          />
                        </View>
                      </BlurCard>
                    ))}
                  </View>

                  <TouchableOpacity
                    style={styles.addSetButton}
                    activeOpacity={0.8}
                    onPress={() => handleAddSet(routineExercise.id)}
                  >
                    <Ionicons name="add" size={16} color={t.textPrimary} />
                    <Text style={styles.addSetButtonText}>Agregar set</Text>
                  </TouchableOpacity>
                </BlurCard>
              ))}

              <TouchableOpacity
                style={styles.addExerciseButton}
                activeOpacity={0.8}
                onPress={() => {
                  navigation.navigate("ExercisePicker");
                }}
              >
                <Ionicons name="add" size={20} color={t.textPrimary} />
                <Text style={styles.addExerciseButtonText}>
                  Agregar ejercicio
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      )}
    </View>
  );
}
