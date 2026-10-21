import { useMemo } from "react";
import {
  Alert,
  StyleSheet,
  TouchableOpacity,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useCallback, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import useAuthStore from "../store/useAuthStore";
import BlurCard from "../components/ui/BlurCard";
import { trainingSessionService } from "../services/trainingSessionService";
import { routineService } from "../services/routineService";
import { useAppTheme } from "../hooks/useAppTheme";
import { ThemeColors } from "../theme";

const H_PADDING = 20;

function getStyles(t: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: t.background,
    },
    scrollContent: {
      paddingHorizontal: H_PADDING,
      paddingTop: 56,
      paddingBottom: 40,
    },
    avatarSection: {
      alignItems: "center",
      marginBottom: 36,
    },
    avatarCircle: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: t.primaryMuted,
      borderWidth: 2,
      borderColor: t.primaryBorder,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 14,
    },
    avatarInitial: {
      color: t.textPrimary,
      fontFamily: "Inter-Bold",
      fontSize: 40,
    },
    emailText: {
      color: t.textSecondary,
      fontSize: 14,
      letterSpacing: 0.3,
    },
    sectionLabel: {
      color: t.textTertiary,
      fontSize: 10,
      fontFamily: "Inter-Bold",
      letterSpacing: 2,
      marginBottom: 12,
    },
    statsRow: {
      flexDirection: "row",
      gap: 12,
      marginBottom: 32,
    },
    statCard: {
      flex: 1,
      alignItems: "center",
      paddingVertical: 20,
      borderRadius: 18,
    },
    statNumber: {
      color: t.primary,
      fontFamily: "Inter-Bold",
      fontSize: 30,
      letterSpacing: 0.5,
      marginBottom: 4,
    },
    statLabel: {
      color: t.textTertiary,
      fontSize: 11,
      letterSpacing: 0.5,
    },
    navSection: {
      gap: 10,
      marginBottom: 36,
    },
    navCard: {
      borderRadius: 16,
      padding: 0,
    },
    navCardContent: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 18,
      paddingVertical: 16,
    },
    navCardLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
    },
    navIconWrap: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: t.primaryMuted,
      alignItems: "center",
      justifyContent: "center",
    },
    navCardLabel: {
      color: t.textPrimary,
      fontFamily: "Inter-Bold",
      fontSize: 15,
      letterSpacing: 0.3,
    },
    logoutButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      backgroundColor: "rgba(255,75,75,0.08)",
      borderWidth: 1,
      borderColor: "rgba(255,75,75,0.22)",
      borderRadius: 14,
      paddingVertical: 16,
    },
    logoutButtonText: {
      color: "rgba(255,75,75,0.9)",
      fontFamily: "Inter-Bold",
      fontSize: 15,
      letterSpacing: 0.3,
    },
  });
}

export default function ProfileScreen({ navigation }: any) {
  const { logout, email } = useAuthStore();
  const t = useAppTheme();
  const styles = useMemo(() => getStyles(t), [t]);

  const [sessionCount, setSessionCount] = useState<number | null>(null);
  const [routineCount, setRoutineCount] = useState<number | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchStats();
    }, []),
  );

  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const [sessions, routines] = await Promise.all([
        trainingSessionService.findAll(),
        routineService.findAll(),
      ]);
      setSessionCount(sessions.length);
      setRoutineCount(routines.length);
    } catch {
      // stats failure is non-critical
    } finally {
      setStatsLoading(false);
    }
  };

  const confirmLogout = () => {
    Alert.alert(
      "Cerrar sesión",
      "¿Estás seguro de que quieres cerrar sesión?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Cerrar sesión", style: "destructive", onPress: logout },
      ],
    );
  };

  const initial = email ? email[0].toUpperCase() : "?";

  const navItems = [
    {
      key: "gyms",
      label: "Gimnasios",
      icon: "business-outline" as const,
      screen: "GymList",
    },
    {
      key: "exercises",
      label: "Ejercicios",
      icon: "barbell-outline" as const,
      screen: "ExerciseList",
    },
    {
      key: "theme",
      label: "Apariencia",
      icon: "color-palette-outline" as const,
      screen: "Theme",
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.avatarSection}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitial}>{initial}</Text>
          </View>
          <Text style={styles.emailText}>{email}</Text>
        </View>

        <Text style={styles.sectionLabel}>ESTADÍSTICAS</Text>
        <View style={styles.statsRow}>
          <BlurCard style={{ flex: 1, borderRadius: 18 }} contentStyle={{ paddingVertical: 20, alignItems: "center" }}>
            {statsLoading ? (
              <ActivityIndicator color={t.primary} size="small" />
            ) : (
              <Text style={styles.statNumber}>
                {sessionCount !== null ? sessionCount : "—"}
              </Text>
            )}
            <Text style={styles.statLabel}>Sesiones</Text>
          </BlurCard>
          <BlurCard style={{ flex: 1, borderRadius: 18 }} contentStyle={{ paddingVertical: 20, alignItems: "center" }}>
            {statsLoading ? (
              <ActivityIndicator color={t.primary} size="small" />
            ) : (
              <Text style={styles.statNumber}>
                {routineCount !== null ? routineCount : "—"}
              </Text>
            )}
            <Text style={styles.statLabel}>Rutinas</Text>
          </BlurCard>
        </View>

        <Text style={styles.sectionLabel}>CONFIGURACIÓN</Text>
        <View style={styles.navSection}>
          {navItems.map((item) => (
            <TouchableOpacity
              key={item.key}
              activeOpacity={0.8}
              onPress={() => navigation.navigate(item.screen)}
            >
              <BlurCard style={{ borderRadius: 16 }} contentStyle={{ padding: 0 }}>
                <View style={styles.navCardContent}>
                  <View style={styles.navCardLeft}>
                    <View style={styles.navIconWrap}>
                      <Ionicons name={item.icon} size={18} color={t.textPrimary} />
                    </View>
                    <Text style={styles.navCardLabel}>{item.label}</Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={t.textTertiary}
                  />
                </View>
              </BlurCard>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={styles.logoutButton}
          activeOpacity={0.8}
          onPress={confirmLogout}
        >
          <Ionicons
            name="log-out-outline"
            size={18}
            color="rgba(255,75,75,0.9)"
          />
          <Text style={styles.logoutButtonText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
