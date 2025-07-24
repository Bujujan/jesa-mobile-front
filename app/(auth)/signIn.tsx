import AsyncStorage from "@react-native-async-storage/async-storage";
import { Button, Input } from "@rneui/themed";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  Keyboard,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

export default function SignIn() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
    setError("");
  };

  const onSignInPress = async () => {
    if (!formData.email || !formData.password) {
      setError("Email and password are required");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${
          process.env.EXPO_PUBLIC_API_URL || "http://192.168.11.105:3000"
        }/auth/signin`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `Failed to sign in, status: ${response.status}`
        );
      }

      const data = await response.json();
      console.log("✅ Sign-in successful:", data);
      // Store token for authenticated requests
      await AsyncStorage.setItem("auth_token", data.token);
      router.replace("/(tabs)");
    } catch (err: any) {
      setError(err.message || "Failed to sign in");
      console.error("🚨 Sign-in error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#e5e7eb" />
        <View style={styles.header}>
          <Image
            source={require("../../assets/images/JesaBlue.png")}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>
        <View style={styles.formContainer}>
          <Text style={styles.titleText}>Welcome Back</Text>
          <Text style={styles.subtitleText}>Happy to see you</Text>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <Input
              onChangeText={(text) => handleChange("email", text)}
              value={formData.email}
              placeholder="JohnDoe@example.com"
              autoCapitalize="none"
              keyboardType="email-address"
              containerStyle={styles.inputContainerStyle}
              inputContainerStyle={styles.inputContainerInner}
              inputStyle={styles.inputStyle}
              labelStyle={{ display: "none" }}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Password</Text>
            <Input
              onChangeText={(text) => handleChange("password", text)}
              value={formData.password}
              secureTextEntry
              placeholder="Enter your password"
              autoCapitalize="none"
              containerStyle={styles.inputContainerStyle}
              inputContainerStyle={styles.inputContainerInner}
              inputStyle={styles.inputStyle}
              labelStyle={{ display: "none" }}
            />
          </View>

          <Button
            title={loading ? "Signing In..." : "Sign In"}
            disabled={loading}
            onPress={onSignInPress}
            buttonStyle={styles.signInButton}
            titleStyle={styles.signInButtonText}
          />

          <View style={styles.signUpContainer}>
            <Text style={styles.signUpText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/signUp")}>
              <Text style={styles.signUpLink}>Sign up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e5e7eb",
  },
  header: {
    alignItems: "center",
    paddingTop: 40,
    paddingBottom: 30,
  },
  logoImage: {
    width: 200,
    height: 50,
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  titleText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 8,
  },
  subtitleText: {
    fontSize: 16,
    color: "#6b7280",
    marginBottom: 40,
  },
  errorText: {
    fontSize: 14,
    color: "#dc2626",
    marginBottom: 20,
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 8,
  },
  inputContainerStyle: {
    paddingHorizontal: 0,
  },
  inputContainerInner: {
    borderBottomWidth: 0,
    backgroundColor: "white",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  inputStyle: {
    fontSize: 16,
    color: "#1f2937",
  },
  signInButton: {
    backgroundColor: "#1e40af",
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 20,
    marginBottom: 30,
  },
  signInButtonText: {
    fontSize: 18,
    fontWeight: "600",
  },
  signUpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  signUpText: {
    fontSize: 14,
    color: "#6b7280",
  },
  signUpLink: {
    fontSize: 14,
    color: "#1e40af",
    fontWeight: "600",
  },
});
