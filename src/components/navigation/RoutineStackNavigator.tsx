import { createStackNavigator } from "@react-navigation/stack";
import RoutineScreen from "../../screens/RoutinesScreen";
import EditRoutineScreen from "../../screens/EditRoutineScreen";
import ExercisePickerScreen from "@/src/screens/ExercisePickerScreen";
import GymPickerScreen from "@/src/screens/GymPickerScreen";
import ActiveTrainingSessionScreen from "@/src/screens/ActiveTrainingSessionScreen";
import TrainingSessionSummaryScreen from "@/src/screens/TrainingSessionSummaryScreen";
import ExerciseDetailScreen from "@/src/screens/ExerciseDetailScreen";

const Stack = createStackNavigator();

export default function RoutineStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Routines"
        component={RoutineScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="EditRoutine"
        component={EditRoutineScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="GymPicker"
        component={GymPickerScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ActiveTrainingSession"
        component={ActiveTrainingSessionScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ExercisePicker"
        component={ExercisePickerScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ExerciseDetail"
        component={ExerciseDetailScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="TrainingSessionSummary"
        component={TrainingSessionSummaryScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
