import { useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import axios from "axios";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../../lib/supabase";

interface System {
  uuid: string;
  system_number: string;
  description: string;
  area: string;
  system_type: string;
  contractors: string;
}

const RecordPunchScreen = () => {
  const { id, projectName } = useLocalSearchParams<{
    id: string;
    projectName: string;
  }>();
  const { getToken } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    projectName: projectName || "",
    system: "",
    punchTitle: "",
    punchDescription: "",
    punchCategory: "",
    punchStatus: "OPEN",
  });

  const [systems, setSystems] = useState<System[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // For image handling
  const [localImageUri, setLocalImageUri] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);

  const [showSystemPicker, setShowSystemPicker] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showStatusPicker, setShowStatusPicker] = useState(false);

  const categories = ["A", "B", "C", "D"];
  const statuses = ["OPEN", "CLOSED"];

  const fetchSystems = async () => {
    if (!id) return setError("No project ID provided");

    try {
      setLoading(true);
      setError(null);

      const token = await getToken();
      if (!token) throw new Error("No authentication token found");

      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_API_URL}/systems/project/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSystems(response.data || []);
    } catch (err: any) {
      console.error(err);
      setError(
        err.response
          ? `Server error: ${err.response.status} - ${
              err.response.data?.message || "Unknown error"
            }`
          : err.request
          ? "Network error. Please check your connection."
          : err.message || "Failed to fetch systems. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchSystems();
  }, [id]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImagePicker = async (source: "camera" | "gallery") => {
    try {
      let result: ImagePicker.ImagePickerResult;

      if (source === "camera") {
        const { granted } = await ImagePicker.requestCameraPermissionsAsync();
        if (!granted)
          return Alert.alert("Permission required", "Camera access is needed.");
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 0.7, // Increased quality slightly
          allowsEditing: true, // Allow basic editing
          aspect: [4, 3],
        });
      } else {
        const { granted } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!granted)
          return Alert.alert(
            "Permission required",
            "Gallery access is needed."
          );
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 0.7,
          allowsEditing: true,
          aspect: [4, 3],
        });
      }

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const uri = asset.uri;
        setLocalImageUri(uri); // preview

        // Create FormData for proper file upload
        const formData = new FormData();

        // Generate unique filename
        const fileName = `punch_${Date.now()}.jpg`;

        // For React Native, we need to handle the file differently
        const fileExtension = uri.split(".").pop() || "jpg";
        const mimeType = `image/${fileExtension}`;

        // Create the file object for FormData
        formData.append("file", {
          uri: uri,
          type: mimeType,
          name: fileName,
        } as any);

        // Alternative method: Convert to base64 then to blob
        try {
          // Method 1: Try direct upload with FormData approach
          const { data, error } = await supabase.storage
            .from("punch-images")
            .upload(fileName, formData, {
              contentType: mimeType,
              upsert: true,
            });

          if (error) {
            console.error("FormData upload failed:", error);

            // Method 2: Fallback to base64 conversion
            const base64Response = await fetch(uri);
            const blob = await base64Response.blob();

            // Check if blob has content
            if (blob.size === 0) {
              throw new Error("Image file is empty or corrupted");
            }

            const { data: retryData, error: retryError } =
              await supabase.storage
                .from("punch-images")
                .upload(fileName, blob, {
                  contentType: mimeType,
                  upsert: true,
                });

            if (retryError) throw retryError;
          }

          const { data: publicData } = supabase.storage
            .from("punch-images")
            .getPublicUrl(fileName);

          setUploadedImageUrl(publicData.publicUrl);
          Alert.alert("Success", "Image uploaded successfully!");
        } catch (uploadError) {
          console.error("Upload error:", uploadError);

          // Method 3: Last resort - try with XMLHttpRequest approach
          try {
            const response = await fetch(uri);
            const arrayBuffer = await response.arrayBuffer();
            const uint8Array = new Uint8Array(arrayBuffer);

            if (uint8Array.length === 0) {
              throw new Error("Image data is empty");
            }

            const { data, error } = await supabase.storage
              .from("punch-images")
              .upload(fileName, uint8Array, {
                contentType: mimeType,
                upsert: true,
              });

            if (error) throw error;

            const { data: publicData } = supabase.storage
              .from("punch-images")
              .getPublicUrl(fileName);

            setUploadedImageUrl(publicData.publicUrl);
            Alert.alert("Success", "Image uploaded successfully!");
          } catch (finalError) {
            throw finalError;
          }
        }
      }
    } catch (err: any) {
      console.error("Image picker error:", err);
      Alert.alert("Error", `Failed to upload image: ${err.message}`);
      // Clear the local image on error
      setLocalImageUri(null);
      setUploadedImageUrl(null);
    }
  };

  const handleCreatePunch = async () => {
    if (
      !id ||
      !formData.system ||
      !formData.punchTitle ||
      !formData.punchDescription ||
      !formData.punchCategory ||
      !formData.punchStatus
    ) {
      return Alert.alert("Error", "Please fill in all required fields.");
    }

    try {
      setLoading(true);
      const token = await getToken();
      if (!token) throw new Error("No authentication token found");

      const punchData = {
        project_id: id,
        system_id: formData.system,
        title: formData.punchTitle,
        description: formData.punchDescription,
        category: formData.punchCategory,
        status: formData.punchStatus,
        image_url: uploadedImageUrl || undefined,
      };

      await axios.post(
        `${process.env.EXPO_PUBLIC_API_URL}/punches`,
        punchData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Alert.alert("Success", "Punch created successfully!");
      router.back();
    } catch (err: any) {
      console.error(err);
      Alert.alert(
        "Error",
        err.response
          ? `Server error: ${err.response.status} - ${
              err.response.data?.message || "Unknown error"
            }`
          : err.request
          ? "Network error. Please check your connection."
          : err.message || "Failed to create punch."
      );
    } finally {
      setLoading(false);
    }
  };

  const DropdownField = ({
    label,
    value,
    placeholder,
    options,
    onValueChange,
    showPicker,
    setShowPicker,
    getOptionLabel,
    getOptionValue,
  }: {
    label: string;
    value: string;
    placeholder: string;
    options: any[];
    onValueChange: (value: string) => void;
    showPicker: boolean;
    setShowPicker: (show: boolean) => void;
    getOptionLabel?: (option: any) => string;
    getOptionValue?: (option: any) => string;
  }) => (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TouchableOpacity
        style={styles.dropdownContainer}
        onPress={() => setShowPicker(!showPicker)}
      >
        <Text style={[styles.dropdownText, !value && styles.placeholderText]}>
          {value
            ? getOptionLabel
              ? options.find((opt) => getOptionValue?.(opt) === value)
                  ?.system_number || placeholder
              : value
            : placeholder}
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
            itemStyle={styles.pickerItem}
          >
            <Picker.Item
              label={placeholder}
              value=""
              style={styles.pickerItem}
            />
            {options.map((option, index) => (
              <Picker.Item
                key={index}
                label={getOptionLabel ? getOptionLabel(option) : option}
                value={getOptionValue ? getOptionValue(option) : option}
                style={styles.pickerItem}
              />
            ))}
          </Picker>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Record a Punch</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Project</Text>
          <TextInput
            style={[styles.textInput, styles.readOnlyInput]}
            value={formData.projectName}
            editable={false}
            placeholderTextColor="#999"
          />
        </View>

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#007AFF"
            style={{ marginBottom: 25 }}
          />
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchSystems}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <DropdownField
            label="System"
            value={formData.system}
            placeholder="Choose a system"
            options={systems}
            onValueChange={(value) => handleInputChange("system", value)}
            showPicker={showSystemPicker}
            setShowPicker={setShowSystemPicker}
            getOptionLabel={(system) => system.system_number}
            getOptionValue={(system) => system.uuid}
          />
        )}

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

        <DropdownField
          label="Punch Category"
          value={formData.punchCategory}
          placeholder="Choose a category"
          options={categories}
          onValueChange={(value) => handleInputChange("punchCategory", value)}
          showPicker={showCategoryPicker}
          setShowPicker={setShowCategoryPicker}
        />

        <DropdownField
          label="Punch Status"
          value={formData.punchStatus}
          placeholder="Choose a status"
          options={statuses}
          onValueChange={(value) => handleInputChange("punchStatus", value)}
          showPicker={showStatusPicker}
          setShowPicker={setShowStatusPicker}
        />

        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Punch Image</Text>
          <TouchableOpacity
            style={styles.imagePickerContainer}
            onPress={() =>
              Alert.alert("Select Image", "Choose an option", [
                { text: "Camera", onPress: () => handleImagePicker("camera") },
                {
                  text: "Gallery",
                  onPress: () => handleImagePicker("gallery"),
                },
                { text: "Cancel", style: "cancel" },
              ])
            }
          >
            <Text style={styles.imagePickerText}>
              {localImageUri ? "Image selected" : "Insert punch image"}
            </Text>
            <Ionicons name="camera-outline" size={20} color="#999" />
          </TouchableOpacity>

          {localImageUri && (
            <Image
              source={{ uri: localImageUri }}
              style={{
                width: "100%",
                height: 200,
                marginTop: 10,
                borderRadius: 12,
              }}
              resizeMode="cover"
            />
          )}
        </View>

        <TouchableOpacity
          style={[styles.createButton, loading && styles.createButtonDisabled]}
          onPress={handleCreatePunch}
          disabled={loading}
        >
          <Text style={styles.createButtonText}>
            {loading ? "Creating..." : "Create Punch"}
          </Text>
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
    width: 34,
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
  readOnlyInput: {
    backgroundColor: "#F0F0F0",
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
    color: "black",
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
    color: "black",
    backgroundColor: "white",
  },
  pickerItem: {
    fontSize: 16,
    color: "black",
    backgroundColor: "white",
    ...Platform.select({
      ios: {
        fontSize: 16,
        color: "black",
      },
      android: {
        fontSize: 16,
        color: "black",
      },
    }),
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
  createButtonDisabled: {
    backgroundColor: "#99C2FF",
  },
  createButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  loaderContainer: {
    marginBottom: 25,
    alignItems: "center",
  },
  errorContainer: {
    marginBottom: 25,
    alignItems: "center",
  },
  errorText: {
    fontSize: 16,
    color: "red",
    textAlign: "center",
    marginBottom: 10,
  },
  retryButton: {
    backgroundColor: "#007AFF",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  retryText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
  },
});

export default RecordPunchScreen;
