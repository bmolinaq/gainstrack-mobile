import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
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
import { useFocusEffect } from "@react-navigation/native";
import useActiveTrainingSessionStore from "../store/useActiveTrainingSessionStore";
import useExercisePickerStore from "../store/useExercisePickerStore";
import BlurCard from "../components/ui/BlurCard";
import ExerciseThumbnail from "../components/ui/ExerciseThumbnail";
import PopoverMenu from "../components/ui/PopoverMenu";
import {
  TrainingSessionExercise,
  TrainingSessionSet,
} from "../types/trainingSession.types";
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
      paddingTop: 14,
      paddingBottom: 14,
    },
    headerLeftGroup: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    backButton: {
      width: 34,
      height: 34,
      borderRadius: 10,
      backgroundColor: t.divider,
      borderWidth: 1,
      borderColor: t.surfaceBorder,
      alignItems: "center",
      justifyContent: "center",
    },
    timerCompact: {
      flexDirection: "row",
      alignItems: "center",
      gap: 7,
    },
    timerDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: t.primary,
    },
    timerText: {
      color: t.textPrimary,
      fontFamily: "Inter-Bold",
      fontSize: 18,
      letterSpacing: 1.5,
    },
    finalizeButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      backgroundColor: t.primary,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    finalizeButtonText: {
      color: t.primaryOnPrimary,
      fontFamily: "Inter-Bold",
      fontSize: 13,
      letterSpacing: 0.2,
    },
    scrollContent: {
      paddingHorizontal: H_PADDING,
      paddingBottom: 40,
      gap: 16,
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
    emptyContainer: {
      marginTop: 24,
      alignItems: "center",
    },
    emptyText: {
      color: t.textTertiary,
      fontSize: 14,
      letterSpacing: 0.5,
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
    exerciseOptionsButton: {
      padding: 4,
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
    deleteSetButton: {
      width: 26,
      height: 26,
      borderRadius: 8,
      backgroundColor: "rgba(255,75,75,0.08)",
      alignItems: "center",
      justifyContent: "center",
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
      color: t.textTertiary,
      fontFamily: "Inter-Bold",
      fontSize: 17,
      paddingVertical: 4,
    },
    setInputCompleted: {
      color: t.textPrimary,
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
    },
    addExerciseButtonText: {
      color: t.textPrimary,
      fontFamily: "Inter-Bold",
      fontSize: 15,
      letterSpacing: 0.5,
    },
    deleteSessionButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      backgroundColor: "rgba(255,75,75,0.08)",
      borderWidth: 1,
      borderColor: "rgba(255,75,75,0.22)",
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    deleteSessionButtonText: {
      color: "rgba(255,75,75,0.9)",
      fontFamily: "Inter-Bold",
      fontSize: 13,
      letterSpacing: 0.2,
    },
    checkButton: {
      width: 30,
      height: 30,
      borderRadius: 15,
      borderWidth: 1.5,
      borderColor: t.surfaceBorder,
      alignItems: "center",
      justifyContent: "center",
    },
    checkButtonCompleted: {
      backgroundColor: t.primary,
      borderColor: t.primary,
    },
  });
}

export default function ActiveTrainingSessionScreen({ navigation }: any) {
  const t = useAppTheme();
  const styles = useMemo(() => getStyles(t), [t]);

  const {
    routineId,
    gymId,
    activeTrainingSession,
    startTimestamp,
    completedSetIds,
    setStartTimestamp,
    updateActiveTrainingSession,
    toggleCompletedSetId,
    clearTrainingSession,
  } = useActiveTrainingSessionStore();

  const [openExerciseMenuId, setOpenExerciseMenuId] = useState<number | null>(
    null,
  );

  const { pickedExercise, clearPickedExercise } = useExercisePickerStore();

  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const scrollViewRef = useRef<ScrollView>(null);

  useFocusEffect(
    useCallback(() => {
      if (pickedExercise !== null) {
        updateActiveTrainingSession((prev) => ({
          ...prev,
          exercises: [
            ...prev.exercises,
            {
              id: -Date.now(),
              orderIndex: prev.exercises.length + 1,
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

  useEffect(() => {
    if (startTimestamp === null) {
      setStartTimestamp(Date.now());
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTimestamp!) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTimestamp]);

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

  const handleBackToMenu = () => {
    navigation.navigate("Routines");
  };

  const handleDeleteSession = () => {
    Alert.alert(
      "Eliminar sesión",
      "¿Estás seguro que quieres eliminar la sesión activa?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: handleConfirmDeleteSession,
        },
      ],
    );
  };

  const handleConfirmDeleteSession = () => {
    clearTrainingSession();
    navigation.reset({
      index: 0,
      routes: [{ name: "Routines" }],
    });
  };

  const handleUpdateSessionNotes = (notes: string) => {
    updateActiveTrainingSession((prev) => ({ ...prev, notes }));
  };

  const handleDeleteExercise = () => {
    updateActiveTrainingSession((prev) => ({
      ...prev,
      exercises: prev.exercises
        .filter((exercise) => exercise.id !== openExerciseMenuId)
        .map((exercise, index) => ({ ...exercise, orderIndex: index + 1 })),
    }));
    setOpenExerciseMenuId(null);
  };

  const handleUpdateSetWeight = (
    exerciseId: number,
    setId: number,
    value: string,
  ) => {
    updateActiveTrainingSession((prev) => ({
      ...prev,
      exercises: prev.exercises.map((exercise) =>
        exercise.id !== exerciseId
          ? exercise
          : {
              ...exercise,
              sets: exercise.sets.map((set) =>
                set.id !== setId
                  ? set
                  : { ...set, weight: value === "" ? null : parseFloat(value) },
              ),
            },
      ),
    }));
  };

  const handleUpdateSetReps = (
    exerciseId: number,
    setId: number,
    value: string,
  ) => {
    updateActiveTrainingSession((prev) => ({
      ...prev,
      exercises: prev.exercises.map((exercise) =>
        exercise.id !== exerciseId
          ? exercise
          : {
              ...exercise,
              sets: exercise.sets.map((set) =>
                set.id !== setId
                  ? set
                  : { ...set, reps: value === "" ? null : parseInt(value, 10) },
              ),
            },
      ),
    }));
  };

  const handleDeleteSet = (exerciseId: number, setId: number) => {
    updateActiveTrainingSession((prev) => ({
      ...prev,
      exercises: prev.exercises.map((exercise) =>
        exercise.id !== exerciseId
          ? exercise
          : {
              ...exercise,
              sets: exercise.sets
                .filter((set) => set.id !== setId)
                .map((set, index) => ({ ...set, setNumber: index + 1 })),
            },
      ),
    }));
  };

  const handleAddSet = (exerciseId: number) => {
    updateActiveTrainingSession((prev) => ({
      ...prev,
      exercises: prev.exercises.map((exercise) =>
        exercise.id !== exerciseId
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
  };

  const handleFinalizeSession = () => {
    navigation.navigate("TrainingSessionSummary");
  };

  const formatTime = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  if (activeTrainingSession === null) return null;

  return (
    <View style={styles.flex}>
      {/* Header */}
      <View style={styles.headerBar}>
        <View style={styles.headerLeftGroup}>
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.8}
            onPress={handleBackToMenu}
          >
            <Ionicons name="chevron-back" size={20} color={t.textPrimary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteSessionButton}
            activeOpacity={0.8}
            onPress={handleDeleteSession}
          >
            <Ionicons
              name="trash-outline"
              size={14}
              color="rgba(255,75,75,0.9)"
            />
            <Text style={styles.deleteSessionButtonText}>Eliminar</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.timerCompact}>
          <View style={styles.timerDot} />
          <Text style={styles.timerText}>{formatTime(elapsedSeconds)}</Text>
        </View>

        <TouchableOpacity
          style={styles.finalizeButton}
          activeOpacity={0.8}
          onPress={handleFinalizeSession}
        >
          <Text style={styles.finalizeButtonText}>Finalizar</Text>
          <Ionicons name="checkmark" size={14} color={t.primaryOnPrimary} />
        </TouchableOpacity>
      </View>

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
            {/* Session notes */}
            <BlurCard style={{ borderRadius: 18 }}>
              <View style={styles.notesCardHeader}>
                <Ionicons
                  name="document-text-outline"
                  size={15}
                  color={t.textTertiary}
                />
                <Text style={styles.notesCardLabel}>Notas de la sesión</Text>
              </View>
              <TextInput
                value={activeTrainingSession.notes ?? ""}
                placeholder="Sin notas"
                placeholderTextColor={t.textTertiary}
                style={styles.notesInput}
                multiline
                onFocus={handleInputFocus}
                onChangeText={handleUpdateSessionNotes}
              />
            </BlurCard>

            {/* Exercises */}
            {activeTrainingSession.exercises.length === 0 && (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  Sin ejercicios aún. Agrega uno abajo.
                </Text>
              </View>
            )}

            {activeTrainingSession.exercises
              .slice()
              .sort((a, b) => a.orderIndex - b.orderIndex)
              .map((ex: TrainingSessionExercise) => (
                <BlurCard key={ex.id} style={{ borderRadius: 22 }}>
                  {/* Exercise header */}
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
                    <PopoverMenu
                      isVisible={openExerciseMenuId === ex.id}
                      onRequestClose={() => setOpenExerciseMenuId(null)}
                      from={(sourceRef) => (
                        <TouchableOpacity
                          ref={sourceRef as any}
                          onPress={() => setOpenExerciseMenuId(ex.id)}
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
                        onPress={() => handleDeleteExercise()}
                      />
                    </PopoverMenu>
                  </TouchableOpacity>

                  {/* Exercise notes */}
                  <View style={styles.exerciseNotesRow}>
                    <Ionicons
                      name="create-outline"
                      size={13}
                      color={t.textTertiary}
                      style={styles.exerciseNotesIcon}
                    />
                    <TextInput
                      defaultValue={ex.notes ?? ""}
                      placeholder="Notas del ejercicio"
                      placeholderTextColor={t.textTertiary}
                      style={styles.exerciseNotesInput}
                      onFocus={handleInputFocus}
                    />
                  </View>

                  <View style={styles.setsDivider} />

                  {/* Sets */}
                  <View style={styles.setsContainer}>
                    {ex.sets
                      .slice()
                      .sort((a, b) => a.setNumber - b.setNumber)
                      .map((set: TrainingSessionSet) => (
                        <BlurCard key={set.id} style={{ borderRadius: 16 }} contentStyle={{ padding: 12 }}>
                          <View style={styles.setHeaderRow}>
                            <View style={styles.setHeaderInfo}>
                              <View style={styles.setBadge}>
                                <Text style={styles.setBadgeText}>
                                  {set.setNumber}
                                </Text>
                              </View>
                              <Text style={styles.setLabel}>
                                SERIE {set.setNumber}
                              </Text>
                            </View>
                            <TouchableOpacity
                              style={styles.deleteSetButton}
                              activeOpacity={0.7}
                              onPress={() => handleDeleteSet(ex.id, set.id)}
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
                              <Text style={styles.setInputLabel}>
                                PESO (KG)
                              </Text>
                              <TextInput
                                value={set.weight?.toString() ?? ""}
                                keyboardType="decimal-pad"
                                placeholder="—"
                                placeholderTextColor={t.textDisabled}
                                style={[
                                  styles.setInput,
                                  completedSetIds.has(set.id) &&
                                    styles.setInputCompleted,
                                ]}
                                onFocus={handleInputFocus}
                                onChangeText={(v) =>
                                  handleUpdateSetWeight(ex.id, set.id, v)
                                }
                              />
                            </View>
                            <View style={styles.setInputDivider} />
                            <View style={styles.setInputGroup}>
                              <Text style={styles.setInputLabel}>
                                REPETICIONES
                              </Text>
                              <TextInput
                                value={set.reps?.toString() ?? ""}
                                keyboardType="number-pad"
                                placeholder="—"
                                placeholderTextColor={t.textDisabled}
                                style={[
                                  styles.setInput,
                                  completedSetIds.has(set.id) &&
                                    styles.setInputCompleted,
                                ]}
                                onFocus={handleInputFocus}
                                onChangeText={(v) =>
                                  handleUpdateSetReps(ex.id, set.id, v)
                                }
                              />
                            </View>
                            <View style={styles.setInputDivider} />
                            <TouchableOpacity
                              style={[
                                styles.checkButton,
                                completedSetIds.has(set.id) &&
                                  styles.checkButtonCompleted,
                              ]}
                              activeOpacity={0.7}
                              onPress={() => toggleCompletedSetId(set.id)}
                            >
                              <Ionicons
                                name="checkmark"
                                size={15}
                                color={
                                  completedSetIds.has(set.id)
                                    ? t.primaryOnPrimary
                                    : t.textDisabled
                                }
                              />
                            </TouchableOpacity>
                          </View>

                          <View style={styles.setNotesRow}>
                            <Ionicons
                              name="document-text-outline"
                              size={12}
                              color={t.textTertiary}
                            />
                            <TextInput
                              defaultValue={set.notes ?? ""}
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
                    onPress={() => handleAddSet(ex.id)}
                  >
                    <Ionicons name="add" size={16} color={t.textPrimary} />
                    <Text style={styles.addSetButtonText}>Agregar serie</Text>
                  </TouchableOpacity>
                </BlurCard>
              ))}

            <TouchableOpacity
              style={styles.addExerciseButton}
              activeOpacity={0.8}
              onPress={() => navigation.navigate("ExercisePicker")}
            >
              <Ionicons name="add" size={20} color={t.textPrimary} />
              <Text style={styles.addExerciseButtonText}>
                Agregar ejercicio
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </View>
  );
}
