import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  Image,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const OnboardingScreen = () => {
  const handleGetStarted = () => {
    // Navigate to next screen
    router.push("/(auth)/signUp");
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      {/* Top Blue Section */}
      <SafeAreaView style={styles.topSection}>
        <View style={styles.logoContainer}>
          <Image
            source={require("../assets/images/Jesa.png")}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>
      </SafeAreaView>

      {/* Bottom Light Section */}
      <View style={styles.bottomSection}>
        <View style={styles.contentContainer}>
          <Text style={styles.descriptionText}>
            Your go to company for all your needs.{"\n"}Solutions are our
            commitment.
          </Text>

          <TouchableOpacity
            style={styles.getStartedButton}
            onPress={handleGetStarted}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Get Started</Text>
            <Ionicons name="chevron-forward" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  topSection: {
    flex: 1.5,
    backgroundColor: "#1e40af", // Blue background
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  logoContainer: {
    alignItems: "center",
  },
  logoImage: {
    width: 200,
    height: 100,
    marginBottom: 10,
  },
  bottomSection: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  contentContainer: {
    alignItems: "center",
  },
  descriptionText: {
    fontSize: 18,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 40,
    lineHeight: 28,
    fontWeight: "400",
  },
  getStartedButton: {
    backgroundColor: "#1e40af",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    maxWidth: 300,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    marginRight: 8,
  },
});

export default OnboardingScreen;
