import SixDigitCodeInput from "@/components/SixDigits";
import { useAuth, useSignUp, useUser } from "@clerk/clerk-expo";
import { Button, Input } from "@rneui/themed";
import { useRouter } from "expo-router";
import React from "react";
import { Keyboard, TouchableWithoutFeedback } from "react-native";

import {
  Image,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function SignUp() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [pendingVerification, setPendingVerification] = React.useState(false);
  const [code, setCode] = React.useState("");
  const { getToken } = useAuth();
  const { user } = useUser();

  function extractNameFromEmail(email: string): {
    firstName: string;
    lastName: string;
  } {
    const localPart = email.split("@")[0]; // "john.doe"
    const [firstRaw, lastRaw] = localPart.split(".");

    const capitalize = (str: string) =>
      str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

    return {
      firstName: capitalize(firstRaw || ""),
      lastName: capitalize(lastRaw || ""),
    };
  }

  const createUserOnBackend = async () => {
    const token = await getToken();
    const email = user?.primaryEmailAddress?.emailAddress;

    if (!email || !token) {
      console.error("Missing email or token");
      return;
    }

    const { firstName, lastName } = extractNameFromEmail(email);

    const fullName = `${firstName} ${lastName}`;

    await fetch("https://localhost:8080/api/users/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: firstName,
        surname: lastName,
        role: "commissioning",
      }),
    });
  };

  // Handle submission of sign-up form
  const onSignUpPress = async () => {
    if (!isLoaded) return;

    // Start sign-up process using email and password provided
    try {
      await signUp.create({
        emailAddress,
        password,
      });

      // Send user an email with verification code
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

      // Set 'pendingVerification' to true to display second form
      // and capture OTP code
      setPendingVerification(true);
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2));
    }
  };
  // Handle submission of verification form
  const onVerifyPress = async () => {
    if (!isLoaded) return;

    try {
      // Use the code the user provided to attempt verification
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      });

      // If verification was completed, set the session to active
      // and redirect the user
      if (signUpAttempt.status === "complete") {
        await setActive({ session: signUpAttempt.createdSessionId });
        router.replace("/(tabs)");
      } else {
        // If the status is not complete, check why. User may need to
        // complete further steps.
        console.error(JSON.stringify(signUpAttempt, null, 2));
      }
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2));
    }
  };

  if (pendingVerification) {
    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.containerVerfiy}>
          {/* Logo */}
          <Image
            source={require("../../assets/images/JesaBlue.png")} // Replace with your logo path
            style={styles.logo}
            resizeMode="contain"
          />

          {/* Title */}
          <Text style={styles.title}>Email verification</Text>
          <Text style={styles.subtitle}>Enter the code in your email</Text>

          {/* Input */}
          {/* <TextInput
          value={code}
          onChangeText={setCode}
          placeholder="123456"
          keyboardType="number-pad"
          style={styles.input}
          placeholderTextColor="#9ca3af"
        /> */}

          <SixDigitCodeInput code={code} setCode={setCode} />

          {/* Continue Button */}
          <TouchableOpacity onPress={onVerifyPress} style={styles.button}>
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
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
          <Text style={styles.subtitleText}>
            Fill out this form to continue
          </Text>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Your Email Address</Text>
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
            disabled={!isLoaded}
            onPress={onSignUpPress}
            buttonStyle={styles.signUpButton}
            titleStyle={styles.signUpButtonText}
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
  containerVerfiy: {
    flex: 1,
    justifyContent: "center",
    // alignItems: "center",
    paddingHorizontal: 24, // px-6 in Tailwind = 6 * 4 = 24
    backgroundColor: "white",
    // Gradient background can't be done with plain styles; you can use libraries like react-native-linear-gradient if needed
  },
  logo: {
    width: 192, // w-24 = 24 * 4 = 96
    height: 48, // h-12 = 12 * 4 = 48
    marginBottom: 40, // mb-10 = 10 * 4 = 40
    // flex: 1,
    alignSelf: "center",
  },
  title: {
    fontSize: 20, // text-2xl ~ 20px
    fontWeight: "700", // font-bold
    color: "#111827", // text-gray-900
    marginBottom: 4, // mb-1 = 1 * 4 = 4
    textAlign: "left",
  },
  subtitle: {
    fontSize: 16, // text-base ~16px
    color: "#4b5563", // text-gray-600
    marginBottom: 24, // mb-6 = 6 * 4 = 24
  },
  button: {
    backgroundColor: "#1e40af",
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 20,
    marginBottom: 30,
    width: "100%",
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontSize: 16, // text-base
    fontWeight: "500", // font-medium
  },
});
