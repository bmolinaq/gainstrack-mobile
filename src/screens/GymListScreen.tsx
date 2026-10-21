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
import { useCallback, useEffect, useMemo, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import axios from "axios";
import Toast from "react-native-toast-message";
import PopoverMenu from "../components/ui/PopoverMenu";
import BlurCard from "../components/ui/BlurCard";
import { gymService } from "../services/gymService";
import { APIGainsTrackGymResponse } from "../types/gym.types";
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
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    gymName: {
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
      marginBottom: 20,
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
    saveButton: {
      backgroundColor: t.primary,
      borderRadius: 12,
      paddingVertical: 14,
      alignItems: "center",
      marginBottom: 8,
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

export default function GymListScreen({ navigation }: any) {
  const t = useAppTheme();
  const styles = useMemo(() => getStyles(t), [t]);

  const [gyms, setGyms] = useState<APIGainsTrackGymResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [gymName, setGymName] = useState("");
  const [selectedGym, setSelectedGym] =
    useState<APIGainsTrackGymResponse | null>(null);
  const [isOptionsVisible, setIsOptionsVisible] = useState(false);
  const [editTarget, setEditTarget] = useState<APIGainsTrackGymResponse | null>(
    null,
  );

  useEffect(() => {
    if (!isOptionsVisible && editTarget) {
      const timer = setTimeout(() => {
        setSelectedGym(editTarget);
        setGymName(editTarget.name);
        setModalVisible(true);
        setEditTarget(null);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOptionsVisible, editTarget]);

  useFocusEffect(
    useCallback(() => {
      fetchGyms();
    }, []),
  );

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

  const openCreateModal = () => {
    setSelectedGym(null);
    setGymName("");
    setModalVisible(true);
  };

  const openEditModal = (gym: APIGainsTrackGymResponse) => {
    setEditTarget(gym);
    setIsOptionsVisible(false);
  };

  const handleSave = async () => {
    if (!gymName.trim()) return;
    setIsLoading(true);
    try {
      if (selectedGym) {
        await gymService.update(selectedGym.id, { name: gymName.trim() });
        Toast.show({ type: "success", text1: "Gimnasio actualizado" });
      } else {
        await gymService.save({ name: gymName.trim() });
        Toast.show({ type: "success", text1: "Gimnasio creado" });
      }
      setModalVisible(false);
      fetchGyms();
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

  const handleDelete = async (gym: APIGainsTrackGymResponse) => {
    setIsOptionsVisible(false);
    setIsLoading(true);
    try {
      await gymService.deleteById(gym.id);
      Toast.show({ type: "success", text1: `${gym.name} eliminado` });
      fetchGyms();
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
    <View style={styles.container}>
      <View style={styles.headerBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={22} color={t.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gimnasios</Text>
        <View style={styles.headerRight} />
      </View>

      <FlatList
        data={!isLoading && errorMessage === null ? gyms : []}
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
            {!isLoading && gyms.length === 0 && errorMessage === null && (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No tienes gimnasios aún</Text>
              </View>
            )}
          </>
        }
        renderItem={({ item: gym }) => (
          <BlurCard style={{ borderRadius: 18 }} contentStyle={{ padding: 18, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <Text style={styles.gymName} numberOfLines={2}>
              {gym.name}
            </Text>
            <PopoverMenu
              isVisible={selectedGym?.id === gym.id && isOptionsVisible}
              onRequestClose={() => setIsOptionsVisible(false)}
              from={(sourceRef, showPopover) => (
                <TouchableOpacity
                  ref={sourceRef as any}
                  onPress={() => {
                    setSelectedGym(gym);
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
              <PopoverMenu.Item icon="create-outline" label="Editar" onPress={() => openEditModal(gym)} />
              <PopoverMenu.Item icon="trash-outline" label="Eliminar" danger onPress={() => handleDelete(gym)} />
            </PopoverMenu>
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
                    {selectedGym ? "Editar Gimnasio" : "Nuevo Gimnasio"}
                  </Text>
                  <Text style={styles.modalSubtitle}>
                    {selectedGym ? "MODIFICA LOS DATOS" : "AGREGA UN LUGAR"}
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

              <BlurCard style={{ borderRadius: 20, marginBottom: 20 }} contentStyle={{ padding: 0 }}>
                <View style={styles.inputRow}>
                  <Ionicons
                    name="business-outline"
                    size={18}
                    color={t.textTertiary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    value={gymName}
                    onChangeText={setGymName}
                    placeholder="Nombre del gimnasio"
                    placeholderTextColor={t.textTertiary}
                    style={styles.input}
                    autoCapitalize="sentences"
                    autoFocus
                  />
                </View>
              </BlurCard>

              <TouchableOpacity
                onPress={handleSave}
                style={[
                  styles.saveButton,
                  !gymName.trim() && styles.saveButtonDisabled,
                ]}
                activeOpacity={0.8}
                disabled={!gymName.trim()}
              >
                <Text style={styles.saveButtonText}>
                  {selectedGym ? "Guardar cambios" : "Crear gimnasio"}
                </Text>
              </TouchableOpacity>
            </BlurCard>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}
