import { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { APIGainsTrackGymResponse } from "../types/gym.types";
import { gymService } from "../services/gymService";
import axios from "axios";
import { APIGainstrackErrorResponse } from "../types/api.types";
import { trainingSessionService } from "../services/trainingSessionService";
import useActiveTrainingSessionStore from "../store/useActiveTrainingSessionStore";
import { useAppTheme } from "../hooks/useAppTheme";
import { ThemeColors } from "../theme";

const H_PADDING = 24;

function getStyles(t: ThemeColors) {
  return StyleSheet.create({
    flex: {
      flex: 1,
      backgroundColor: t.background,
    },
    headerBar: {
      flexDirection: "row",
      paddingHorizontal: H_PADDING,
      paddingTop: 16,
      paddingBottom: 8,
    },
    headerCancelButton: {
      paddingHorizontal: 14,
      height: 36,
      borderRadius: 12,
      backgroundColor: t.surfaceElevated,
      alignItems: "center",
      justifyContent: "center",
    },
    headerCancelButtonText: {
      color: t.textPrimary,
      fontFamily: "Inter-Bold",
      fontSize: 14,
      letterSpacing: 0.3,
    },
    content: {
      flex: 1,
      justifyContent: "center",
      paddingHorizontal: H_PADDING,
      marginTop: -48,
    },
    question: {
      color: t.textPrimary,
      fontFamily: "Inter-Bold",
      fontSize: 24,
      textAlign: "center",
      letterSpacing: 0.2,
      marginBottom: 28,
    },
    dropdownContainer: {
      position: "relative",
      zIndex: 10,
      marginBottom: 48,
    },
    dropdownHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: t.surface,
      borderRadius: 16,
      paddingHorizontal: 18,
      paddingVertical: 16,
      borderWidth: 1,
      borderColor: t.surfaceBorder,
    },
    dropdownHeaderText: {
      flex: 1,
      color: t.textPrimary,
      fontFamily: "Inter-Bold",
      fontSize: 15,
      marginRight: 10,
    },
    dropdownPlaceholderText: {
      color: t.textSecondary,
    },
    dropdownList: {
      position: "absolute",
      top: "100%",
      left: 0,
      right: 0,
      marginTop: 8,
      backgroundColor: t.surface,
      borderRadius: 16,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: t.surfaceBorder,
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.5,
      shadowRadius: 12,
      elevation: 12,
    },
    dropdownOption: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 18,
      paddingVertical: 14,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: t.divider,
    },
    dropdownOptionLast: {
      borderBottomWidth: 0,
    },
    dropdownOptionSelected: {
      backgroundColor: t.primaryMuted,
    },
    dropdownOptionText: {
      flex: 1,
      color: t.textSecondary,
      fontSize: 14,
      marginRight: 10,
    },
    dropdownOptionTextSelected: {
      color: t.primary,
      fontFamily: "Inter-Bold",
    },
    dropdownMessageText: {
      color: t.textSecondary,
      fontSize: 13,
      textAlign: "center",
      paddingHorizontal: 18,
      paddingVertical: 16,
    },
    startButton: {
      backgroundColor: t.primary,
      borderRadius: 12,
      paddingVertical: 18,
      alignItems: "center",
    },
    startButtonDisabled: {
      backgroundColor: t.surfaceElevated,
    },
    startButtonText: {
      color: t.primaryOnPrimary,
      fontFamily: "Inter-Bold",
      fontSize: 16,
      letterSpacing: 0.5,
    },
    startButtonTextDisabled: {
      color: t.textTertiary,
    },
  });
}

export default function GymPickerScreen({ route, navigation }: any) {
  const t = useAppTheme();
  const styles = useMemo(() => getStyles(t), [t]);

  const { routineId } = route.params;
  const { setActiveTrainingSession } = useActiveTrainingSessionStore();

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [gyms, setGyms] = useState<APIGainsTrackGymResponse[] | null>(null);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedGym, setSelectedGym] =
    useState<APIGainsTrackGymResponse | null>(null);

  /** Carga los gimnasos del usuario para que pueda seleccionar alguno */
  useEffect(() => {
    const fetchGyms = async () => {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const response = await gymService.findAll();
        setGyms(response);
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
    fetchGyms();
  }, []);

  const handleStartTrainingSession = async () => {
    if (selectedGym === null) return;

    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await trainingSessionService.preview(
        routineId,
        selectedGym.id,
      );

      // Los ejercicios del preview no tienen ID de BD todavía; se asignan IDs
      // negativos únicos para que las keys de React sean válidas y no colisionen
      // con los ejercicios que el usuario agregue manualmente (-Date.now()).
      const normalizedResponse = {
        ...response,
        exercises: response.exercises.map((ex, exIndex) => ({
          ...ex,
          id: -(exIndex + 1),
          sets: ex.sets.map((set, setIndex) => ({
            ...set,
            id: -(exIndex * 1000 + setIndex + 1),
          })),
        })),
      };

      // Se guarda preview en store junto a routineId y gymId para el save final
      setActiveTrainingSession(normalizedResponse, routineId, selectedGym.id);

      // Se redirige a usuario a ActiveSessionScreen con flag para que el
      // RoutineStackNavigator use slide horizontal en esta transición.
      navigation.replace("ActiveTrainingSession", { fromGymPicker: true });
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
      </View>

      <View style={styles.content}>
        <Text style={styles.question}>¿En qué gimnasio te encuentras?</Text>

        <View style={styles.dropdownContainer}>
          <TouchableOpacity
            style={styles.dropdownHeader}
            activeOpacity={0.8}
            disabled={isLoading}
            onPress={() => setIsDropdownOpen((prev) => !prev)}
          >
            <Text
              style={[
                styles.dropdownHeaderText,
                selectedGym === null && styles.dropdownPlaceholderText,
              ]}
              numberOfLines={1}
            >
              {selectedGym ? selectedGym.name : "Selecciona un gimnasio"}
            </Text>
            {isLoading ? (
              <ActivityIndicator color={t.textPrimary} size="small" />
            ) : (
              <Ionicons
                name={isDropdownOpen ? "chevron-up" : "chevron-down"}
                size={20}
                color={t.textTertiary}
              />
            )}
          </TouchableOpacity>

          {isDropdownOpen && !isLoading && (
            <View style={styles.dropdownList}>
              {errorMessage !== null && (
                <Text style={styles.dropdownMessageText}>{errorMessage}</Text>
              )}

              {errorMessage === null &&
                (gyms === null || gyms.length === 0) && (
                  <Text style={styles.dropdownMessageText}>
                    No hay gimnasios disponibles
                  </Text>
                )}

              {errorMessage === null &&
                gyms !== null &&
                gyms.map((gym, index) => {
                  const isSelected = selectedGym?.id === gym.id;
                  return (
                    <TouchableOpacity
                      key={gym.id}
                      style={[
                        styles.dropdownOption,
                        index === gyms.length - 1 && styles.dropdownOptionLast,
                        isSelected && styles.dropdownOptionSelected,
                      ]}
                      activeOpacity={0.7}
                      onPress={() => {
                        setSelectedGym(gym);
                        setIsDropdownOpen(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.dropdownOptionText,
                          isSelected && styles.dropdownOptionTextSelected,
                        ]}
                        numberOfLines={1}
                      >
                        {gym.name}
                      </Text>
                      {isSelected && (
                        <Ionicons name="checkmark" size={18} color={t.primary} />
                      )}
                    </TouchableOpacity>
                  );
                })}
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.startButton,
            selectedGym === null && styles.startButtonDisabled,
          ]}
          activeOpacity={0.8}
          disabled={selectedGym === null}
          onPress={handleStartTrainingSession}
        >
          <Text
            style={[
              styles.startButtonText,
              selectedGym === null && styles.startButtonTextDisabled,
            ]}
          >
            Iniciar Entrenamiento
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
