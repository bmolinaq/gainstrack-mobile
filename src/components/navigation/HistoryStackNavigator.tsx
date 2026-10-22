import { createStackNavigator } from "@react-navigation/stack";
import HistoryScreen from "../../screens/HistoryScreen";
import TrainingSessionDetailScreen from "../../screens/TrainingSessionDetailScreen";
import ExerciseDetailScreen from "../../screens/ExerciseDetailScreen";

const Stack = createStackNavigator();

export default function HistoryStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="History"
        component={HistoryScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="TrainingSessionDetail"
        component={TrainingSessionDetailScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ExerciseDetail"
        component={ExerciseDetailScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
