import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import React, { useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const RecordPunchScreen = ({ navigation }: { navigation: any }) => {
  const [formData, setFormData] = useState({
    projectName: "",
    system: "",
    punchTitle: "",
    punchDescription: "",
    punchCategory: "",
    punchImage: null,
  });

  const [showSystemPicker, setShowSystemPicker] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  const systems = [
    "Electrical",
    "Plumbing",
    "HVAC",
    "Structural",
    "Finishing",
    "Safety",
  ];

  const categories = ["A", "B", "C", "D"];

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImagePicker = () => {
    Alert.alert("Select Image", "Choose an option", [
      { text: "Camera", onPress: () => console.log("Open Camera") },
      { text: "Gallery", onPress: () => console.log("Open Gallery") },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const handleCreatePunch = () => {
    if (!formData.projectName || !formData.punchTitle) {
      Alert.alert("Error", "Please fill in required fields");
      return;
    }

    console.log("Creating punch with data:", formData);
    Alert.alert("Success", "Punch created successfully!");
  };

  const DropdownField = ({
    label,
    value,
    placeholder,
    options,
    onValueChange,
    showPicker,
    setShowPicker,
  }: {
    label: string;
    value: string;
    placeholder: string;
    options: string[];
    onValueChange: (value: string) => void;
    showPicker: boolean;
    setShowPicker: (show: boolean) => void;
  }) => (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TouchableOpacity
        style={styles.dropdownContainer}
        onPress={() => setShowPicker(!showPicker)}
      >
        <Text style={[styles.dropdownText, !value && styles.placeholderText]}>
          {value || placeholder}
        </Text>
        <Ionicons
          name="chevron-down"
          size={20}
          color="#999"
          style={[
            styles.dropdownIcon,
            showPicker && styles.dropdownIconRotated,
          ]}
        />
      </TouchableOpacity>

      {showPicker && (
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={value}
            onValueChange={(itemValue) => {
              onValueChange(itemValue);
              setShowPicker(false);
            }}
            style={styles.picker}
          >
            <Picker.Item label={placeholder} value="" />
            {options.map((option, index) => (
              <Picker.Item key={index} label={option} value={option} />
            ))}
          </Picker>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation?.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Record a Punch</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Project Name */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Project</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Project NAME"
            placeholderTextColor="#999"
            value={formData.projectName}
            onChangeText={(text) => handleInputChange("projectName", text)}
          />
        </View>

        {/* System Dropdown */}
        <DropdownField
          label="System"
          value={formData.system}
          placeholder="Choose a system"
          options={systems}
          onValueChange={(value) => handleInputChange("system", value)}
          showPicker={showSystemPicker}
          setShowPicker={setShowSystemPicker}
        />

        {/* Punch Title */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Punch title</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Enter a title"
            placeholderTextColor="#999"
            value={formData.punchTitle}
            onChangeText={(text) => handleInputChange("punchTitle", text)}
          />
        </View>

        {/* Punch Description */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Punch description</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            placeholder="Enter a description"
            placeholderTextColor="#999"
            value={formData.punchDescription}
            onChangeText={(text) => handleInputChange("punchDescription", text)}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Punch Category Dropdown */}
        <DropdownField
          label="Punch Category"
          value={formData.punchCategory}
          placeholder="Choose a category"
          options={categories}
          onValueChange={(value) => handleInputChange("punchCategory", value)}
          showPicker={showCategoryPicker}
          setShowPicker={setShowCategoryPicker}
        />

        {/* Punch Image */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Punch Image</Text>
          <TouchableOpacity
            style={styles.imagePickerContainer}
            onPress={handleImagePicker}
          >
            <Text style={styles.imagePickerText}>Insert punch image</Text>
            <Ionicons name="camera-outline" size={20} color="#999" />
          </TouchableOpacity>
        </View>

        {/* Create Button */}
        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreatePunch}
        >
          <Text style={styles.createButtonText}>Create Punch</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#F5F5F5",
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },
  headerSpacer: {
    width: 34, // Same width as back button to center title
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  fieldContainer: {
    marginBottom: 25,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: "white",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: "#333",
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  textArea: {
    height: 100,
    paddingTop: 16,
  },
  dropdownContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  dropdownText: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  placeholderText: {
    color: "#999",
  },
  dropdownIcon: {
    marginLeft: 10,
  },
  dropdownIconRotated: {
    transform: [{ rotate: "180deg" }],
  },
  pickerContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    marginTop: 5,
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  picker: {
    height: 150,
  },
  imagePickerContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  imagePickerText: {
    fontSize: 16,
    color: "#999",
    flex: 1,
  },
  createButton: {
    backgroundColor: "#007AFF",
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 40,
  },
  createButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
});

export default RecordPunchScreen;
