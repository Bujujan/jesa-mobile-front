import { Button, Input } from "@rneui/themed";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../../lib/supabase";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function signUpWithEmail() {
    setLoading(true);
    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) {
      Alert.alert(error.message);
    } else {
      Alert.alert("Please check your inbox for email verification.");
      router.replace("/(auth)/signIn"); // ✅ Go to sign in screen after registration
    }
    setLoading(false);
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#e5e7eb" />

      {/* Header Section */}
      <View style={styles.header}>
        <Image
          source={require("../../assets/images/JesaBlue.png")}
          style={styles.logoImage}
          resizeMode="contain"
        />
      </View>

      {/* Form Section */}
      <View style={styles.formContainer}>
        <Text style={styles.titleText}>Let's Get Started</Text>
        <Text style={styles.subtitleText}>Fill out this form to continue</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Your Email Address</Text>
          <Input
            onChangeText={setEmail}
            value={email}
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
            onChangeText={setPassword}
            value={password}
            secureTextEntry
            placeholder="min. 8 characters"
            autoCapitalize="none"
            containerStyle={styles.inputContainerStyle}
            inputContainerStyle={styles.inputContainerInner}
            inputStyle={styles.inputStyle}
            labelStyle={{ display: "none" }}
          />
        </View>

        {/* Sign Up Button */}
        <Button
          title="Sign up"
          disabled={loading}
          onPress={signUpWithEmail}
          buttonStyle={styles.signUpButton}
          titleStyle={styles.signUpButtonText}
          loading={loading}
        />

        {/* Divider */}
        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

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

        {/* Sign In Link */}
        <View style={styles.signInContainer}>
          <Text style={styles.signInText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push("/(auth)/signIn")}>
            <Text style={styles.signInLink}>Sign in</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
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
  inputContainer: {
    // marginBottom: 20,
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
    marginTop: 50,
    marginBottom: 30,
  },
  signUpButtonText: {
    fontSize: 18,
    fontWeight: "600",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#d1d5db",
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: "#6b7280",
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
  microsoftSquare: {
    width: 9,
    height: 9,
    margin: 0.5,
  },
  microsoftButtonText: {
    color: "white",
    fontSize: 16,
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
});
