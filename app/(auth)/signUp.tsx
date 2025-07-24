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

export default function SignUpScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
    setError("");
  };

  const onSignUpPress = async () => {
    if (!formData.email || !formData.password || !formData.name) {
      setError("All fields are required");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${
          process.env.EXPO_PUBLIC_API_URL || "http://192.168.11.105:3000"
        }/auth/signup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...formData,
            role: "commissioning", // Automatically set role
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `Failed to sign up, status: ${response.status}`
        );
      }

      const data = await response.json();
      console.log("✅ User created:", data);
      router.replace("/(tabs)");
    } catch (err: any) {
      setError(err.message || "Failed to create user");
      console.error("🚨 Signup error:", err.message);
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
          <Text style={styles.titleText}>Let's Get Started</Text>
          <Text style={styles.subtitleText}>
            Fill out this form to continue
          </Text>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Your Name</Text>
            <Input
              onChangeText={(text) => handleChange("name", text)}
              value={formData.name}
              placeholder="John Doe"
              autoCapitalize="words"
              containerStyle={styles.inputContainerStyle}
              inputContainerStyle={styles.inputContainerInner}
              inputStyle={styles.inputStyle}
              labelStyle={{ display: "none" }}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Your Email Address</Text>
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
            <Text style={styles.inputLabel}>Choose a Password</Text>
            <Input
              onChangeText={(text) => handleChange("password", text)}
              value={formData.password}
              secureTextEntry
              placeholder="min. 8 characters"
              autoCapitalize="none"
              containerStyle={styles.inputContainerStyle}
              inputContainerStyle={styles.inputContainerInner}
              inputStyle={styles.inputStyle}
              labelStyle={{ display: "none" }}
            />
          </View>

          <Button
            title={loading ? "Signing Up..." : "Sign Up"}
            disabled={loading}
            onPress={onSignUpPress}
            buttonStyle={styles.signUpButton}
            titleStyle={styles.signUpButtonText}
          />

          {/* Microsoft Sign In Button */}
          <TouchableOpacity style={styles.microsoftButton}>
            <Image
              source={require("../../assets/images/microsoft.png")}
              style={styles.microsoftLogo}
              resizeMode="contain"
            />
            <Text style={styles.microsoftButtonText}>
              Continue with Microsoft
            </Text>
          </TouchableOpacity>

          <View style={styles.signInContainer}>
            <Text style={styles.signInText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/signIn")}>
              <Text style={styles.signInLink}>Sign in</Text>
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
    paddingTop: 10,
  },
  titleText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 2,
  },
  subtitleText: {
    fontSize: 16,
    color: "#6b7280",
    marginBottom: 20,
  },
  errorText: {
    fontSize: 14,
    color: "#dc2626",
    marginBottom: 20,
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: 5,
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
  signUpButton: {
    backgroundColor: "#1e40af",
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 20,
    marginBottom: 30,
  },
  signUpButtonText: {
    fontSize: 18,
    fontWeight: "600",
  },
  signInContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  signInText: {
    fontSize: 14,
    color: "#6b7280",
  },
  signInLink: {
    fontSize: 14,
    color: "#1e40af",
    fontWeight: "600",
  },
  microsoftButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2d3748",
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 30,
  },
  microsoftLogo: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: 20,
    height: 20,
    marginRight: 12,
  },
  microsoftButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
