import { SignOutButton } from "@/components/SignOutButton";
import { SignedIn, SignedOut, useUser } from "@clerk/clerk-expo";
import { router } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

export default function Page() {
  const { user } = useUser();

  return (
    <View>
      <SignedIn>
        <Text>Hello {user?.emailAddresses[0].emailAddress}</Text>
        <SignOutButton />
      </SignedIn>
      <SignedOut>
        <TouchableOpacity onPress={() => router.push("/(auth)/signIn")}>
          <Text>Sign in</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push("/(auth)/signUp")}>
          <Text>Sign up</Text>
        </TouchableOpacity>
      </SignedOut>
    </View>
  );
}
