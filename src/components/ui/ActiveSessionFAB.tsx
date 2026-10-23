import { useMemo, useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import useActiveTrainingSessionStore from "../../store/useActiveTrainingSessionStore";
import { useAppTheme } from "../../hooks/useAppTheme";
import { ThemeColors } from "../../theme";
import { APIGainstrackTrainingSessionDetailResponse } from "../../types/trainingSession.types";

type ActiveSessionFABProps = {
  onPress?: () => void;
};

const H_PADDING = 20;
const FADE_DURATION = 250;

const AnimatedTouchableOpacity =
  Animated.createAnimatedComponent(TouchableOpacity);

function getStyles(t: ThemeColors) {
  return StyleSheet.create({
    fab: {
      position: "absolute",
      bottom: 20,
      left: H_PADDING,
      right: H_PADDING,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: t.surface,
      borderWidth: 1.5,
      borderColor: t.primary,
      borderRadius: 16,
      paddingHorizontal: 14,
      paddingVertical: 10,
      gap: 12,
      shadowColor: t.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 12,
      elevation: 10,
    },
    content: {
      flex: 1,
      gap: 4,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    statusRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    dot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: t.primary,
    },
    statusLabel: {
      color: t.primary,
      fontFamily: "Inter-Bold",
      fontSize: 10,
      letterSpacing: 2,
    },
    deleteButton: {
      width: 28,
      height: 28,
      borderRadius: 8,
      backgroundColor: "rgba(255,75,75,0.08)",
      alignItems: "center",
      justifyContent: "center",
    },
    sessionName: {
      flex: 1,
      color: t.textSecondary,
      fontSize: 12,
      marginRight: 10,
    },
    timer: {
      color: t.textPrimary,
      fontFamily: "Inter-Bold",
      fontSize: 15,
      letterSpacing: 1,
    },
  });
}

export default function ActiveSessionFAB({ onPress }: ActiveSessionFABProps) {
  const { activeTrainingSession, startTimestamp, clearTrainingSession } =
    useActiveTrainingSessionStore();
  const t = useAppTheme();
  const styles = useMemo(() => getStyles(t), [t]);

  const isVisible =
    activeTrainingSession !== null && startTimestamp !== null;

  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [displayedSession, setDisplayedSession] =
    useState<APIGainstrackTrainingSessionDetailResponse | null>(
      activeTrainingSession,
    );
  const opacity = useRef(new Animated.Value(isVisible ? 1 : 0)).current;

  useEffect(() => {
    if (isVisible) {
      setDisplayedSession(activeTrainingSession);
      Animated.timing(opacity, {
        toValue: 1,
        duration: FADE_DURATION,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(opacity, {
        toValue: 0,
        duration: FADE_DURATION,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) setDisplayedSession(null);
      });
    }
  }, [isVisible, activeTrainingSession]);

  useEffect(() => {
    if (startTimestamp === null) return;
    const interval = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTimestamp) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTimestamp]);

  if (displayedSession === null) return null;

  const formatTime = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleDelete = () => {
    Alert.alert(
      "Eliminar sesión",
      "¿Estás seguro que quieres eliminar la sesión activa?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Eliminar", style: "destructive", onPress: clearTrainingSession },
      ],
    );
  };

  return (
    <AnimatedTouchableOpacity
      style={[
        styles.fab,
        { opacity, pointerEvents: isVisible ? "auto" : "none" },
      ]}
      activeOpacity={0.9}
      onPress={onPress}
    >
      <Ionicons name="chevron-up" size={24} color={t.primary} />
      <View style={styles.content}>
        <View style={styles.row}>
          <View style={styles.statusRow}>
            <View style={styles.dot} />
            <Text style={styles.statusLabel}>EN PROGRESO</Text>
          </View>
          <TouchableOpacity
            onPress={handleDelete}
            style={styles.deleteButton}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="trash-outline" size={18} color="rgba(255,75,75,0.9)" />
          </TouchableOpacity>
        </View>
        <View style={styles.row}>
          <Text
            style={styles.sessionName}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {displayedSession.notes
              ? displayedSession.notes
              : "Sesión activa"}
          </Text>
          <Text style={styles.timer}>{formatTime(elapsedSeconds)}</Text>
        </View>
      </View>
    </AnimatedTouchableOpacity>
  );
}
