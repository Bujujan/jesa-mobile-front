import { useSignIn } from "@clerk/clerk-expo";
import { Button, Input } from "@rneui/themed";
import { useRouter } from "expo-router";
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

export default function SignIn() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");

  // Handle the submission of the sign-in form
  const onSignInPress = async () => {
    if (!isLoaded) return;

    // Start the sign-in process using the email and password provided
    try {
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      });

      // If sign-in process is complete, set the created session as active
      // and redirect the user
      if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });
        router.replace("/");
      } else {
        // If the status isn't complete, check why. User might need to
        // complete further steps.
        console.error(JSON.stringify(signInAttempt, null, 2));
      }
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2));
    }
  };

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
        <Text style={styles.titleText}>Welcome Back</Text>
        <Text style={styles.subtitleText}>Happy to see you</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Email Address</Text>
          <Input
            onChangeText={setEmailAddress}
            value={emailAddress}
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
            onChangeText={setPassword}
            value={password}
            secureTextEntry
            placeholder="Enter your password"
            autoCapitalize="none"
            containerStyle={styles.inputContainerStyle}
            inputContainerStyle={styles.inputContainerInner}
            inputStyle={styles.inputStyle}
            labelStyle={{ display: "none" }}
          />
        </View>

        {/* Sign In Button */}
        <Button
          title="Sign in"
          disabled={!isLoaded}
          onPress={onSignInPress}
          buttonStyle={styles.signInButton}
          titleStyle={styles.signInButtonText}
          loading={!isLoaded}
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

        {/* Sign Up Link */}
        <View style={styles.signUpContainer}>
          <Text style={styles.signUpText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push("/(auth)/signUp")}>
            <Text style={styles.signUpLink}>Sign up</Text>
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
  signInButton: {
    backgroundColor: "#1e40af",
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 50,
    marginBottom: 30,
  },
  signInButtonText: {
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
  microsoftButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  signUpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    // marginTop: 50,
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
