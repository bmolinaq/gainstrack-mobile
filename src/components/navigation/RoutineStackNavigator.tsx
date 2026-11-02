import { createNativeStackNavigator } from "@react-navigation/native-stack";
import RoutineScreen from "../../screens/RoutinesScreen";
import EditRoutineScreen from "../../screens/EditRoutineScreen";
import GymPickerScreen from "@/src/screens/GymPickerScreen";

const Stack = createNativeStackNavigator();

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
    </Stack.Navigator>
  );
}
