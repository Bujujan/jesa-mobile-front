import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // <-- hide header for all auth screens
      }}
    />
  );
}
