import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Modal,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
} from "react-native";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import axios from "axios";
import Toast from "react-native-toast-message";
import PopoverMenu from "../components/ui/PopoverMenu";
import BlurCard from "../components/ui/BlurCard";
import { exerciseService } from "../services/exerciseService";
import { muscleGroupService } from "../services/muscleGroupService";
import { APIGainsTrackExerciseResponse } from "../types/exercise.types";
import { APIGainsTrackMuscleGroupResponse } from "../types/muscleGroup.types";
import { APIGainstrackErrorResponse } from "../types/api.types";
import { useAppTheme } from "../hooks/useAppTheme";
import { ThemeColors } from "../theme";

const H_PADDING = 20;
const CARD_GAP = 12;

function getStyles(t: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: t.background,
    },
    headerBar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: H_PADDING,
      paddingTop: 56,
      paddingBottom: 16,
    },
    backButton: {
      padding: 4,
      width: 36,
    },
    headerTitle: {
      color: t.textPrimary,
      fontFamily: "Inter-Bold",
      fontSize: 20,
      letterSpacing: 0.5,
    },
    headerRight: {
      width: 36,
    },
    listContent: {
      paddingHorizontal: H_PADDING,
      gap: CARD_GAP,
      paddingBottom: 100,
    },
    card: {
      borderRadius: 18,
      padding: 18,
    },
    cardTopRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      marginBottom: 10,
    },
    exerciseName: {
      flex: 1,
      color: t.textPrimary,
      fontFamily: "Inter-Bold",
      fontSize: 15,
      letterSpacing: 0.3,
    },
    optionsButton: {
      padding: 4,
      marginLeft: 8,
    },
    pill: {
      alignSelf: "flex-start",
      backgroundColor: t.primaryMuted,
      borderWidth: 1,
      borderColor: t.primaryBorder,
      borderRadius: 50,
      paddingHorizontal: 10,
      paddingVertical: 4,
    },
    pillText: {
      color: t.primary,
      fontSize: 10,
      fontFamily: "Inter-Bold",
      letterSpacing: 1,
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
      marginBottom: 8,
    },
    errorText: {
      flex: 1,
      color: t.errorText,
      fontSize: 14,
    },
    emptyContainer: {
      marginTop: 80,
      alignItems: "center",
    },
    emptyText: {
      color: t.textTertiary,
      fontSize: 15,
      letterSpacing: 1,
    },
    fab: {
      position: "absolute",
      bottom: 32,
      right: H_PADDING,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: t.primary,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: t.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 10,
      elevation: 8,
    },
    centeredView: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.75)",
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 20,
    },
    modalCard: {
      width: "100%",
      backgroundColor: t.surface,
      borderRadius: 28,
      padding: 24,
    },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 24,
    },
    modalTitle: {
      color: t.textPrimary,
      fontFamily: "Inter-Bold",
      fontSize: 22,
      letterSpacing: 0.5,
    },
    modalSubtitle: {
      color: t.textTertiary,
      fontSize: 10,
      letterSpacing: 3,
      marginTop: 4,
    },
    modalCloseBtn: {
      padding: 4,
    },
    inputCard: {
      borderRadius: 20,
      padding: 0,
      marginBottom: 12,
    },
    inputRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 18,
    },
    inputIcon: {
      marginRight: 14,
    },
    input: {
      flex: 1,
      color: t.textPrimary,
      fontSize: 15,
    },
    dropdownHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: t.surface,
      borderWidth: 1,
      borderColor: t.surfaceBorder,
      borderRadius: 14,
      paddingHorizontal: 20,
      paddingVertical: 16,
      marginBottom: 12,
    },
    dropdownHeaderText: {
      color: t.textPrimary,
      fontSize: 15,
    },
    dropdownPlaceholder: {
      color: t.textTertiary,
    },
    dropdownList: {
      borderRadius: 14,
      padding: 0,
      marginBottom: 12,
    },
    dropdownItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingVertical: 14,
    },
    dropdownItemText: {
      color: t.textSecondary,
      fontSize: 14,
    },
    dropdownItemSelected: {
      color: t.primary,
      fontFamily: "Inter-Bold",
    },
    dropdownDivider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: t.divider,
      marginHorizontal: 16,
    },
    saveButton: {
      backgroundColor: t.primary,
      borderRadius: 12,
      paddingVertical: 14,
      alignItems: "center",
      marginBottom: 8,
      marginTop: 8,
    },
    saveButtonDisabled: {
      opacity: 0.4,
    },
    saveButtonText: {
      color: t.primaryOnPrimary,
      fontFamily: "Inter-Bold",
      fontSize: 16,
      letterSpacing: 0.5,
    },
    cancelButton: {
      paddingVertical: 12,
      alignItems: "center",
    },
    cancelButtonText: {
      color: t.textDisabled,
      fontSize: 14,
      letterSpacing: 0.5,
    },
  });
}

export default function ExerciseListScreen({ navigation }: any) {
  const t = useAppTheme();
  const styles = useMemo(() => getStyles(t), [t]);

  const [exercises, setExercises] = useState<APIGainsTrackExerciseResponse[]>(
    [],
  );
  const [muscleGroups, setMuscleGroups] = useState<
    APIGainsTrackMuscleGroupResponse[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [exerciseName, setExerciseName] = useState("");
  const [selectedMuscleGroup, setSelectedMuscleGroup] =
    useState<APIGainsTrackMuscleGroupResponse | null>(null);
  const [muscleGroupDropdownOpen, setMuscleGroupDropdownOpen] = useState(false);

  const [selectedExercise, setSelectedExercise] =
    useState<APIGainsTrackExerciseResponse | null>(null);
  const [isOptionsVisible, setIsOptionsVisible] = useState(false);
  const [editTarget, setEditTarget] =
    useState<APIGainsTrackExerciseResponse | null>(null);

  useEffect(() => {
    if (!isOptionsVisible && editTarget) {
      const timer = setTimeout(() => {
        setSelectedExercise(editTarget);
        setExerciseName(editTarget.name);
        setSelectedMuscleGroup(editTarget.muscleGroup);
        setMuscleGroupDropdownOpen(false);
        setModalVisible(true);
        setEditTarget(null);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOptionsVisible, editTarget]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, []),
  );

  const fetchData = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const [exercisesResponse, muscleGroupsResponse] = await Promise.all([
        exerciseService.findAll(),
        muscleGroupService.findAll(),
      ]);
      setExercises(exercisesResponse.filter((e) => !e.isPredefined));
      setMuscleGroups(muscleGroupsResponse);
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

  const openCreateModal = () => {
    setSelectedExercise(null);
    setExerciseName("");
    setSelectedMuscleGroup(null);
    setMuscleGroupDropdownOpen(false);
    setModalVisible(true);
  };

  const openEditModal = (exercise: APIGainsTrackExerciseResponse) => {
    setEditTarget(exercise);
    setIsOptionsVisible(false);
  };

  const handleSave = async () => {
    if (!exerciseName.trim() || !selectedMuscleGroup) return;
    setIsLoading(true);
    try {
      if (selectedExercise) {
        await exerciseService.update(selectedExercise.id, {
          name: exerciseName.trim(),
          muscleGroupId: selectedMuscleGroup.id,
        });
        Toast.show({ type: "success", text1: "Ejercicio actualizado" });
      } else {
        await exerciseService.save({
          name: exerciseName.trim(),
          muscleGroupId: selectedMuscleGroup.id,
        });
        Toast.show({ type: "success", text1: "Ejercicio creado" });
      }
      setModalVisible(false);
      fetchData();
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

  const handleDelete = async (exercise: APIGainsTrackExerciseResponse) => {
    setIsOptionsVisible(false);
    setIsLoading(true);
    try {
      await exerciseService.deleteById(exercise.id);
      Toast.show({ type: "success", text1: `${exercise.name} eliminado` });
      fetchData();
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

  const canSave =
    exerciseName.trim().length > 0 && selectedMuscleGroup !== null;

  return (
    <View style={styles.container}>
      <View style={styles.headerBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={22} color={t.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ejercicios</Text>
        <View style={styles.headerRight} />
      </View>

      <FlatList
        data={!isLoading && errorMessage === null ? exercises : []}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
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
            {!isLoading && exercises.length === 0 && errorMessage === null && (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No tienes ejercicios aún</Text>
              </View>
            )}
          </>
        }
        renderItem={({ item: exercise }) => (
          <BlurCard style={{ borderRadius: 18 }} contentStyle={{ padding: 18 }}>
            <View style={styles.cardTopRow}>
              <Text style={styles.exerciseName} numberOfLines={2}>
                {exercise.name}
              </Text>
              <PopoverMenu
                isVisible={
                  selectedExercise?.id === exercise.id && isOptionsVisible
                }
                onRequestClose={() => setIsOptionsVisible(false)}
                from={(sourceRef, showPopover) => (
                  <TouchableOpacity
                    ref={sourceRef as any}
                    onPress={() => {
                      setSelectedExercise(exercise);
                      setIsOptionsVisible(true);
                    }}
                    style={styles.optionsButton}
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
                <PopoverMenu.Item icon="create-outline" label="Editar" onPress={() => openEditModal(exercise)} />
                <PopoverMenu.Item icon="trash-outline" label="Eliminar" danger onPress={() => handleDelete(exercise)} />
              </PopoverMenu>
            </View>
            <View style={styles.pill}>
              <Text style={styles.pillText}>
                {exercise.muscleGroup.name.toUpperCase()}
              </Text>
            </View>
          </BlurCard>
        )}
      />

      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.85}
        onPress={openCreateModal}
      >
        <Ionicons name="add" size={28} color={t.primaryOnPrimary} />
      </TouchableOpacity>

      <Modal animationType="fade" visible={modalVisible} transparent>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.centeredView}>
            <BlurCard style={{ width: "100%", borderRadius: 28 }} contentStyle={{ padding: 24 }}>
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>
                    {selectedExercise ? "Editar Ejercicio" : "Nuevo Ejercicio"}
                  </Text>
                  <Text style={styles.modalSubtitle}>
                    {selectedExercise
                      ? "MODIFICA LOS DATOS"
                      : "AGREGA UN MOVIMIENTO"}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  style={styles.modalCloseBtn}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="close"
                    size={22}
                    color={t.textTertiary}
                  />
                </TouchableOpacity>
              </View>

              <BlurCard style={{ borderRadius: 20, marginBottom: 12 }} contentStyle={{ padding: 0 }}>
                <View style={styles.inputRow}>
                  <Ionicons
                    name="barbell-outline"
                    size={18}
                    color={t.textTertiary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    value={exerciseName}
                    onChangeText={setExerciseName}
                    placeholder="Nombre del ejercicio"
                    placeholderTextColor={t.textTertiary}
                    style={styles.input}
                    autoCapitalize="sentences"
                  />
                </View>
              </BlurCard>

              {/* Selector de grupo muscular */}
              <TouchableOpacity
                style={styles.dropdownHeader}
                activeOpacity={0.8}
                onPress={() =>
                  setMuscleGroupDropdownOpen(!muscleGroupDropdownOpen)
                }
              >
                <Text
                  style={[
                    styles.dropdownHeaderText,
                    !selectedMuscleGroup && styles.dropdownPlaceholder,
                  ]}
                >
                  {selectedMuscleGroup
                    ? selectedMuscleGroup.name
                    : "Grupo muscular"}
                </Text>
                <Ionicons
                  name={muscleGroupDropdownOpen ? "chevron-up" : "chevron-down"}
                  size={16}
                  color={t.textTertiary}
                />
              </TouchableOpacity>

              {muscleGroupDropdownOpen && (
                <BlurCard style={{ borderRadius: 14, marginBottom: 12 }} contentStyle={{ padding: 0 }}>
                  <ScrollView
                    style={{ maxHeight: 180 }}
                    showsVerticalScrollIndicator={false}
                    nestedScrollEnabled
                  >
                    {muscleGroups.map((mg, index) => (
                      <View key={mg.id}>
                        <TouchableOpacity
                          style={styles.dropdownItem}
                          activeOpacity={0.7}
                          onPress={() => {
                            setSelectedMuscleGroup(mg);
                            setMuscleGroupDropdownOpen(false);
                          }}
                        >
                          <Text
                            style={[
                              styles.dropdownItemText,
                              selectedMuscleGroup?.id === mg.id &&
                                styles.dropdownItemSelected,
                            ]}
                          >
                            {mg.name}
                          </Text>
                          {selectedMuscleGroup?.id === mg.id && (
                            <Ionicons
                              name="checkmark"
                              size={16}
                              color={t.primary}
                            />
                          )}
                        </TouchableOpacity>
                        {index < muscleGroups.length - 1 && (
                          <View style={styles.dropdownDivider} />
                        )}
                      </View>
                    ))}
                  </ScrollView>
                </BlurCard>
              )}

              <TouchableOpacity
                onPress={handleSave}
                style={[
                  styles.saveButton,
                  !canSave && styles.saveButtonDisabled,
                  muscleGroupDropdownOpen && { marginTop: 12 },
                ]}
                activeOpacity={0.8}
                disabled={!canSave}
              >
                <Text style={styles.saveButtonText}>
                  {selectedExercise ? "Guardar cambios" : "Crear ejercicio"}
                </Text>
              </TouchableOpacity>
            </BlurCard>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}
