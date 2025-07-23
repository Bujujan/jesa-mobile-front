// RootLayout.tsx
import { ClerkProvider } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import InnerLayout from "../components/InnerLayout";

export default function RootLayout() {
  return (
    <ClerkProvider tokenCache={tokenCache}>
      <InnerLayout />
    </ClerkProvider>
  );
}
