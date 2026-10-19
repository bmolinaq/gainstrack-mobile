import { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ImageBackground,
} from "react-native";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { authService } from "../services/authService";
import useAuthStore from "../store/useAuthStore";
import axios from "axios";
import { APIGainstrackErrorResponse } from "../types/api.types";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { BlurView } from "expo-blur";
import { useAppTheme } from "../hooks/useAppTheme";
import { ThemeColors } from "../theme";

function getStyles(t: ThemeColors) {
  return StyleSheet.create({
    container: {
      flexGrow: 1,
      justifyContent: "center",
      paddingHorizontal: 24,
      paddingVertical: 24,
    },
    header: {
      alignItems: "center",
    },
    textTitle: {
      color: "#FFFFFF",
      fontFamily: "Inter-Bold",
      fontSize: 38,
      letterSpacing: 1.5,
      textShadowColor: "rgba(0,0,0,0.4)",
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 6,
    },
    textSubtitle: {
      color: "rgba(255,255,255,0.8)",
      fontSize: 11,
      letterSpacing: 3,
      marginTop: 8,
      textShadowColor: "rgba(0,0,0,0.3)",
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 4,
    },
    formCard: {
      borderRadius: 28,
      overflow: "hidden",
      backgroundColor: "rgba(0,0,0,0.35)",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.08)",
    },
    formCardInner: {
      paddingHorizontal: 28,
      paddingVertical: 36,
      gap: 16,
    },
    formHeader: {
      alignItems: "center",
      marginBottom: 30,
    },
    card: {
      borderColor: "rgba(255,255,255,0.08)",
      borderWidth: 1,
      borderRadius: 18,
      overflow: "hidden",
    },
    inputRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 18,
    },
    icon: {
      marginRight: 14,
    },
    divider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: t.divider,
      marginHorizontal: 20,
    },
    input: {
      flex: 1,
      color: t.textPrimary,
      fontSize: 15,
    },
    loginButton: {
      backgroundColor: t.primary,
      borderRadius: 12,
      paddingVertical: 18,
      marginTop: 6,
    },
    loginButtonText: {
      color: t.primaryOnPrimary,
      fontFamily: "Inter-Bold",
      fontSize: 16,
      textAlign: "center",
      letterSpacing: 0.5,
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
    registerText: {
      color: t.textTertiary,
      textAlign: "center",
      fontSize: 13,
      marginTop: 4,
    },
    socialContainer: {
      alignItems: "center",
      gap: 14,
      marginTop: 8,
    },
    socialLabel: {
      color: t.textDisabled,
      fontSize: 11,
      letterSpacing: 2,
    },
    googleButton: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: "#FFFFFF",
      justifyContent: "center",
      alignItems: "center",
    },
  });
}

export default function LoginScreen({ navigation }: any) {
  const t = useAppTheme();
  const styles = useMemo(() => getStyles(t), [t]);

  const { login } = useAuthStore();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      if (email.length > 0 && password.length > 0) {
        const response = await authService.login({ email, password });
        login(response.token, email);
      } else {
        setErrorMessage("Campos no pueden estar vacíos");
      }
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

  const handleGoogleLogin = () => {
    console.log("INICIO LOGIN GOOGLE");
  };

  return (
    <View style={{ flex: 1 }}>
      <ImageBackground
        source={require("../../assets/gainstrack-login.png")}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      />
      <BlurView intensity={10} tint="dark" style={StyleSheet.absoluteFill} />

      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        automaticallyAdjustKeyboardInsets
      >
        <View style={styles.formCard}>
          <View style={styles.formCardInner}>
            <View style={styles.formHeader}>
              <Text style={styles.textTitle}>GainsTrack</Text>
              <Text style={styles.textSubtitle}>CONTROLA TU PROGRESO</Text>
            </View>

            <BlurView intensity={50} tint="dark" style={styles.card}>
              <View style={styles.inputRow}>
                <Ionicons
                  name="mail-outline"
                  size={18}
                  color={t.textTertiary}
                  style={styles.icon}
                />
                <TextInput
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    setErrorMessage(null);
                  }}
                  placeholder="Correo electrónico"
                  placeholderTextColor={t.textTertiary}
                  style={styles.input}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.divider} />

              <View style={styles.inputRow}>
                <Ionicons
                  name="lock-closed-outline"
                  size={18}
                  color={t.textTertiary}
                  style={styles.icon}
                />
                <TextInput
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    setErrorMessage(null);
                  }}
                  placeholder="Contraseña"
                  placeholderTextColor={t.textTertiary}
                  secureTextEntry
                  style={styles.input}
                />
              </View>
            </BlurView>

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
              onPress={handleLogin}
              disabled={isLoading}
              style={styles.loginButton}
              activeOpacity={0.7}
            >
              <Text style={styles.loginButtonText}>Iniciar sesión</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate("Register")}
              activeOpacity={0.6}
            >
              <Text style={styles.registerText}>
                ¿No tienes cuenta? Regístrate
              </Text>
            </TouchableOpacity>

            <View style={styles.socialContainer}>
              <Text style={styles.socialLabel}>o continúa con</Text>
              <TouchableOpacity
                onPress={handleGoogleLogin}
                style={styles.googleButton}
                activeOpacity={0.8}
              >
                <AntDesign name="google" size={22} color="#EA4335" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      <Modal visible={isLoading} transparent>
        <LoadingSpinner />
      </Modal>
    </View>
  );
}
