import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import useAuthStore from "../../store/useAuthStore";
import AuthNavigator from "./AuthNavigator";
import RoutineStackNavigator from "./RoutineStackNavigator";
import HistoryStackNavigator from "./HistoryStackNavigator";
import ProfileStackNavigator from "./ProfileStackNavigator";
import ActiveTrainingSessionScreen from "../../screens/ActiveTrainingSessionScreen";
import ExercisePickerScreen from "../../screens/ExercisePickerScreen";
import ExerciseDetailScreen from "../../screens/ExerciseDetailScreen";
import TrainingSessionSummaryScreen from "../../screens/TrainingSessionSummaryScreen";
import { getFocusedRouteNameFromRoute } from "@react-navigation/native";
import { useAppTheme } from "../../hooks/useAppTheme";

const Tab = createBottomTabNavigator();
const RootStack = createNativeStackNavigator();

const TAB_BAR_LABEL_STYLE = {
  fontFamily: "Inter-Bold",
  fontSize: 11,
  letterSpacing: 0.3,
};

function MainTabsNavigator() {
  const insets = useSafeAreaInsets();
  const t = useAppTheme();

  const tabBarStyle = {
    backgroundColor: t.background,
    borderTopWidth: 0,
    height: 80,
    paddingTop: 8,
    paddingBottom: 24,
  };

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle,
        tabBarActiveTintColor: t.primary,
        tabBarInactiveTintColor: t.textTertiary,
        tabBarLabelStyle: TAB_BAR_LABEL_STYLE,
        headerShown: false,
        sceneStyle: {
          backgroundColor: t.background,
          paddingTop: insets.top + 12,
        },
      }}
    >
      <Tab.Screen
        name="Rutinas"
        component={RoutineStackNavigator}
        options={({ route }) => ({
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="barbell-outline" size={size} color={color} />
          ),
          tabBarStyle:
            getFocusedRouteNameFromRoute(route) === "EditRoutine" ||
            getFocusedRouteNameFromRoute(route) === "GymPicker"
              ? { display: "none" }
              : tabBarStyle,
        })}
      />
      <Tab.Screen
        name="Historial"
        component={HistoryStackNavigator}
        options={({ route }) => ({
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="time-outline" size={size} color={color} />
          ),
          tabBarStyle:
            getFocusedRouteNameFromRoute(route) === "TrainingSessionDetail"
              ? { display: "none" }
              : tabBarStyle,
        })}
      />
      <Tab.Screen
        name="Perfil"
        component={ProfileStackNavigator}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  const { token } = useAuthStore();
  const insets = useSafeAreaInsets();
  const t = useAppTheme();

  if (token === null) return <AuthNavigator />;

  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      <RootStack.Screen name="MainTabs" component={MainTabsNavigator} />
      <RootStack.Screen
        name="ActiveTrainingSession"
        component={ActiveTrainingSessionScreen}
        options={({ route }) => ({
          gestureEnabled: false,
          presentation: "fullScreenModal",
          animation: (route.params as any)?.fromGymPicker
            ? "slide_from_right"
            : "slide_from_bottom",
        })}
      />
      <RootStack.Screen
        name="ExercisePicker"
        component={ExercisePickerScreen}
        options={{
          contentStyle: {
            backgroundColor: t.background,
            paddingTop: insets.top + 12,
          },
        }}
      />
      <RootStack.Screen
        name="ExerciseDetail"
        component={ExerciseDetailScreen}
        options={{
          contentStyle: {
            backgroundColor: t.background,
            paddingTop: insets.top + 12,
          },
        }}
      />
      <RootStack.Screen
        name="TrainingSessionSummary"
        component={TrainingSessionSummaryScreen}
        options={{
          contentStyle: {
            backgroundColor: t.background,
            paddingTop: insets.top + 12,
          },
        }}
      />
    </RootStack.Navigator>
  );
}
