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
} from "react-native";
import { useCallback, useMemo, useState } from "react";
import { APIGainstrackRoutineSummaryResponse } from "../types/routine.types";
import axios from "axios";
import { APIGainstrackErrorResponse } from "../types/api.types";
import { routineService } from "../services/routineService";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import Popover from "react-native-popover-view";
import { useFocusEffect } from "@react-navigation/native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import GlassCard from "../components/ui/GlassCard";
import useActiveTrainingSessionStore from "../store/useActiveTrainingSessionStore";
import ActiveSessionFAB from "../components/ui/ActiveSessionFAB";
import { useAppTheme } from "../hooks/useAppTheme";
import { ThemeColors, RADIUS } from "../theme";

const H_PADDING = 20;
const CARD_GAP = 14;


function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getStyles(t: ThemeColors) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: t.background,
    },
    centeredView: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.75)",
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 20,
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
    addButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: t.primary,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: t.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.45,
      shadowRadius: 10,
      elevation: 8,
    },
    // ── Filters ─────────────────────────────────────────────
    filtersContainer: {
      paddingHorizontal: H_PADDING,
      paddingBottom: 20,
    },
    filtersScrollContent: {
      gap: 8,
      flexDirection: "row",
    },
    chip: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: RADIUS.pill,
      borderWidth: 1,
      borderColor: t.surfaceBorder,
    },
    chipActive: {
      backgroundColor: t.primary,
      borderColor: t.primary,
    },
    chipText: {
      color: t.textSecondary,
      fontSize: 13,
      letterSpacing: 0.2,
    },
    chipTextActive: {
      color: t.primaryOnPrimary,
      fontFamily: "Inter-Bold",
    },
    // ── Cards ───────────────────────────────────────────────
    card: {
      borderRadius: RADIUS.xl,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.07)",
      overflow: "hidden",
    },
    cardGradient: {
      padding: 20,
      gap: 14,
    },
    cardTopRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
    },
    routineName: {
      flex: 1,
      color: t.textPrimary,
      fontFamily: "Inter-Bold",
      fontSize: 18,
      letterSpacing: 0.2,
      lineHeight: 24,
    },
    optionsButton: {
      padding: 4,
      marginLeft: 8,
      marginTop: 2,
    },
    routineNotes: {
      color: "rgba(255,255,255,0.45)",
      fontSize: 13,
      lineHeight: 18,
    },
    metaRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    routineDate: {
      color: "rgba(255,255,255,0.30)",
      fontSize: 11,
      letterSpacing: 0.5,
    },
    startButton: {
      backgroundColor: t.primary,
      borderRadius: RADIUS.pill,
      paddingVertical: 12,
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "center",
      gap: 6,
    },
    startButtonText: {
      color: t.primaryOnPrimary,
      fontFamily: "Inter-Bold",
      fontSize: 14,
      letterSpacing: 0.5,
    },
    // ── Popover ─────────────────────────────────────────────
    popover: {
      backgroundColor: "transparent",
      borderRadius: 14,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.12)",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.55,
      shadowRadius: 16,
      elevation: 12,
      overflow: "hidden",
      padding: 0,
    },
    popoverMenu: {
      minWidth: 170,
    },
    popoverItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingHorizontal: 18,
      paddingVertical: 14,
    },
    popoverItemText: {
      color: t.textPrimary,
      fontSize: 14,
      letterSpacing: 0.2,
    },
    popoverItemDanger: {
      color: "rgba(255,75,75,0.9)",
      fontSize: 14,
      letterSpacing: 0.2,
    },
    popoverDivider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: t.divider,
    },
    // ── States ───────────────────────────────────────────────
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
    emptyContainer: {
      marginTop: 64,
      alignItems: "center",
      gap: 8,
    },
    emptyTitle: {
      color: t.textTertiary,
      fontFamily: "Inter-Bold",
      fontSize: 16,
      marginTop: 12,
    },
    emptySubtitle: {
      color: t.textDisabled,
      fontSize: 13,
    },
    // ── Modal ────────────────────────────────────────────────
    createRoutineModalView: {
      width: "100%",
      borderRadius: 28,
      overflow: "hidden",
    },
    createRoutineModalBlur: {
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
    modalInputCard: {
      borderRadius: 20,
      padding: 0,
      marginBottom: 20,
    },
    modalDivider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: t.divider,
      marginHorizontal: 20,
    },
    inputIcon: {
      marginRight: 14,
    },
    input: {
      flex: 1,
      color: t.textPrimary,
      fontSize: 15,
    },
    inputMultiline: {
      textAlignVertical: "top",
      paddingTop: 4,
      minHeight: 60,
    },
    inputRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 18,
    },
    createButton: {
      backgroundColor: t.primary,
      borderRadius: RADIUS.pill,
      paddingVertical: 14,
      alignItems: "center",
      marginBottom: 8,
    },
    createButtonText: {
      color: t.primaryOnPrimary,
      fontFamily: "Inter-Bold",
      fontSize: 16,
      letterSpacing: 0.5,
    },
    cancelButton: {
      paddingVertical: 14,
      alignItems: "center",
    },
    bottomFade: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      height: 72,
      pointerEvents: "none",
    },
    cancelButtonText: {
      color: t.textDisabled,
      fontSize: 14,
      letterSpacing: 0.5,
    },
  });
}

export default function RoutineScreen({ navigation }: any) {
  const t = useAppTheme();
  const styles = useMemo(() => getStyles(t), [t]);

  const { activeTrainingSession } = useActiveTrainingSessionStore();

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [routinesItems, setRoutinesItems] = useState<
    APIGainstrackRoutineSummaryResponse[]
  >([]);
  const [isCreateRoutineModalOpen, setIsCreateRoutineModalOpen] =
    useState<boolean>(false);
  const [routineName, setRoutineName] = useState<string>("");
  const [routineNotes, setRoutineNotes] = useState<string>("");
  const [routineSelected, setRoutineSelected] =
    useState<APIGainstrackRoutineSummaryResponse | null>(null);
  const [isOptionsVisibles, setIsOptionVisibles] = useState<boolean>(false);
  useFocusEffect(
    useCallback(() => {
      fetchRoutines();
    }, []),
  );

  const fetchRoutines = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await routineService.findAll();
      setRoutinesItems(response);
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

  const handleOpenCreateRoutineModal = () => {
    setRoutineName("");
    setRoutineNotes("");
    setIsCreateRoutineModalOpen(true);
  };

  const handleCreateRoutine = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await routineService.save({
        name: routineName,
        notes: routineNotes,
      });

      Toast.show({
        type: "success",
        text1: "Rutina creada",
        text2: response.name,
      });

      fetchRoutines();
      setIsCreateRoutineModalOpen(false);
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

  const handleCloseCreateRoutineModal = () => {
    setIsCreateRoutineModalOpen(false);
  };

  const handleDeleteRoutine = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    if (routineSelected == null) {
      setErrorMessage("No se ha seleccionado una rutina para eliminar");
      return;
    }

    try {
      await routineService.delete(routineSelected?.id);
      fetchRoutines();

      Toast.show({
        type: "success",
        text1: `Rutina ${routineSelected?.name} eliminada`,
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

  const listData =
    !isLoading && errorMessage === null ? routinesItems : [];

  return (
    <View style={styles.screen}>
      {/* ── Header ── */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.headerSubtitle}>MIS ENTRENAMIENTOS</Text>
          <Text style={styles.headerTitle}>Rutinas</Text>
        </View>
        <TouchableOpacity
          onPress={handleOpenCreateRoutineModal}
          style={styles.addButton}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={22} color={t.primaryOnPrimary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={listData}
        keyExtractor={(routine) => routine.id.toString()}
        contentContainerStyle={[
          styles.listContent,
          activeTrainingSession !== null && { paddingBottom: 120 },
        ]}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            {isLoading && (
              <ActivityIndicator
                color={t.primary}
                size="large"
                style={{ marginTop: 24, marginBottom: 8 }}
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

            {!isLoading &&
              routinesItems.length === 0 &&
              errorMessage === null && (
                <View style={styles.emptyContainer}>
                  <Ionicons
                    name="barbell-outline"
                    size={48}
                    color={t.textDisabled}
                  />
                  <Text style={styles.emptyTitle}>Aún no tienes rutinas</Text>
                  <Text style={styles.emptySubtitle}>
                    Crea tu primera usando el + de arriba
                  </Text>
                </View>
              )}
          </>
        }
        renderItem={({ item: routine }) => {
          return (
            <View style={styles.card}>
              <BlurView
                tint="systemUltraThinMaterialDark"
                intensity={35}
                style={styles.cardGradient}
              >
                {/* Top row: name + menu */}
                <View style={styles.cardTopRow}>
                  <Text style={styles.routineName} numberOfLines={2}>
                    {routine.name}
                  </Text>
                  <Popover
                    isVisible={
                      routineSelected?.id === routine.id && isOptionsVisibles
                    }
                    onRequestClose={() => setIsOptionVisibles(false)}
                    from={(sourceRef, showPopover) => (
                      <TouchableOpacity
                        ref={sourceRef as any}
                        onPress={() => {
                          setRoutineSelected(routine);
                          setIsOptionVisibles(true);
                        }}
                        style={styles.optionsButton}
                        activeOpacity={0.6}
                      >
                        <Ionicons
                          name="ellipsis-vertical"
                          size={18}
                          color="rgba(255,255,255,0.40)"
                        />
                      </TouchableOpacity>
                    )}
                    popoverStyle={styles.popover}
                    backgroundStyle={{ backgroundColor: "transparent" }}
                  >
                    <BlurView tint="systemUltraThinMaterialDark" intensity={60} style={styles.popoverMenu}>
                      <TouchableOpacity
                        style={styles.popoverItem}
                        activeOpacity={0.7}
                        onPress={() => {
                          setIsOptionVisibles(false);
                          navigation.navigate("EditRoutine", {
                            routineId: routine.id,
                          });
                        }}
                      >
                        <Ionicons
                          name="create-outline"
                          size={16}
                          color={t.textSecondary}
                        />
                        <Text style={styles.popoverItemText}>Editar</Text>
                      </TouchableOpacity>
                      <View style={styles.popoverDivider} />
                      <TouchableOpacity
                        style={styles.popoverItem}
                        activeOpacity={0.7}
                      >
                        <Ionicons
                          name="copy-outline"
                          size={16}
                          color={t.textSecondary}
                        />
                        <Text style={styles.popoverItemText}>Duplicar</Text>
                      </TouchableOpacity>
                      <View style={styles.popoverDivider} />
                      <TouchableOpacity
                        onPress={handleDeleteRoutine}
                        style={styles.popoverItem}
                        activeOpacity={0.7}
                      >
                        <Ionicons
                          name="trash-outline"
                          size={16}
                          color="rgba(255,75,75,0.9)"
                        />
                        <Text style={styles.popoverItemDanger}>Eliminar</Text>
                      </TouchableOpacity>
                    </BlurView>
                  </Popover>
                </View>

                {/* Notes */}
                {routine.notes ? (
                  <Text style={styles.routineNotes} numberOfLines={2}>
                    {routine.notes}
                  </Text>
                ) : null}

                {/* Date badge */}
                <View style={styles.metaRow}>
                  <Ionicons
                    name="calendar-outline"
                    size={12}
                    color="rgba(255,255,255,0.30)"
                  />
                  <Text style={styles.routineDate}>
                    {formatDate(routine.createdAt)}
                  </Text>
                </View>

                {/* Start button */}
                <TouchableOpacity
                  onPress={() => {
                    navigation.navigate("GymPicker", {
                      routineId: routine.id,
                    });
                  }}
                  style={styles.startButton}
                  activeOpacity={0.85}
                >
                  <Text style={styles.startButtonText}>Iniciar</Text>
                  <Ionicons
                    name="arrow-forward"
                    size={14}
                    color={t.primaryOnPrimary}
                  />
                </TouchableOpacity>
              </BlurView>
            </View>
          );
        }}
      />

      {/* ── Create routine modal ── */}
      <Modal
        animationType="fade"
        visible={isCreateRoutineModalOpen}
        transparent={true}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.centeredView}>
            <View style={styles.createRoutineModalView}>
            <BlurView tint="systemUltraThinMaterialDark" intensity={60} style={styles.createRoutineModalBlur}>
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>Nueva Rutina</Text>
                  <Text style={styles.modalSubtitle}>
                    CONFIGURA TU ENTRENAMIENTO
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={handleCloseCreateRoutineModal}
                  style={styles.modalCloseBtn}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close" size={22} color={t.textTertiary} />
                </TouchableOpacity>
              </View>

              <GlassCard intensity="subtle" style={styles.modalInputCard}>
                <View style={styles.inputRow}>
                  <Ionicons
                    name="barbell-outline"
                    size={18}
                    color={t.textTertiary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    value={routineName}
                    onChangeText={(text) => {
                      setRoutineName(text);
                      setErrorMessage(null);
                    }}
                    placeholder="Nombre de la rutina"
                    placeholderTextColor={t.textTertiary}
                    style={styles.input}
                    autoCapitalize="sentences"
                  />
                </View>
                <View style={styles.modalDivider} />
                <View style={styles.inputRow}>
                  <Ionicons
                    name="document-text-outline"
                    size={18}
                    color={t.textTertiary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    value={routineNotes}
                    onChangeText={(text) => {
                      setRoutineNotes(text);
                      setErrorMessage(null);
                    }}
                    placeholder="Notas (opcional)"
                    placeholderTextColor={t.textTertiary}
                    style={[styles.input, styles.inputMultiline]}
                    autoCapitalize="sentences"
                    multiline
                    numberOfLines={3}
                  />
                </View>
              </GlassCard>

              {errorMessage !== null && (
                <View style={[styles.errorBanner, { marginBottom: 16 }]}>
                  <Ionicons
                    name="alert-circle-outline"
                    size={16}
                    color={t.errorText}
                  />
                  <Text style={styles.errorText}>{errorMessage}</Text>
                </View>
              )}

              <TouchableOpacity
                onPress={handleCreateRoutine}
                style={styles.createButton}
                activeOpacity={0.8}
              >
                <Text style={styles.createButtonText}>Crear rutina</Text>
              </TouchableOpacity>

            </BlurView>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <LinearGradient
        colors={["transparent", t.background]}
        style={styles.bottomFade}
        pointerEvents="none"
      />

      <ActiveSessionFAB
        onPress={() => {
          navigation.navigate("ActiveTrainingSession");
        }}
      />
    </View>
  );
}
