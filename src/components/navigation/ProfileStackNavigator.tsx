import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ProfileScreen from "../../screens/ProfileScreen";
import GymListScreen from "../../screens/GymListScreen";
import ExerciseListScreen from "../../screens/ExerciseListScreen";
import ThemeScreen from "../../screens/ThemeScreen";

const Stack = createNativeStackNavigator();

export default function ProfileStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="GymList"
        component={GymListScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ExerciseList"
        component={ExerciseListScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Theme"
        component={ThemeScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
