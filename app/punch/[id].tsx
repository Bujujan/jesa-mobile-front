import { useAuth, useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// Define the Punch type based on the backend Punch entity
interface Punch {
  uuid: string;
  title: string;
  description?: string;
  status: string;
  category?: string;
  image_url?: string;
  project: { name: string; uuid: string };
  created_by?: {
    uuid: string;
    name: string;
    email: string;
    role: string;
    created_at: string;
  } | null;
  modified_by?: {
    uuid: string;
    name: string;
    email: string;
    role: string;
    created_at: string;
  } | null;
  system?: { id: string; name: string };
  created_at: string;
  updated_at: string;
}

const PunchDetailsScreen = () => {
  const { user } = useUser();
  const { getToken } = useAuth();
  const { id, projectName } = useLocalSearchParams();
  const [punch, setPunch] = useState<Punch | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedPunch, setEditedPunch] = useState<Partial<Punch>>({});
  const router = useRouter();

  const fetchPunch = async () => {
    if (!user) {
      setError("User not authenticated");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const token = await getToken();
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_API_URL}/punches/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("API Response:", response.data);

      if (response.data) {
        setPunch(response.data);
        setEditedPunch(response.data);
      } else {
        throw new Error("Failed to fetch punch details");
      }
    } catch (err: any) {
      console.error("Fetch error:", err);
      if (err.response) {
        setError(
          `Server error: ${err.response.status} - ${
            err.response.data?.message || "Unknown error"
          }`
        );
      } else if (err.request) {
        setError("Network error. Please check your connection.");
      } else {
        setError(
          err.message || "Failed to fetch punch details. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const saveChanges = async () => {
    if (!user) {
      setError("User not authenticated");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const token = await getToken();
      if (!token) {
        throw new Error("No authentication token found");
      }

      const updatePunchDto = {
        title: editedPunch.title,
        description: editedPunch.description,
        status: editedPunch.status,
        category: editedPunch.category,
      };

      const response = await axios.put(
        `${process.env.EXPO_PUBLIC_API_URL}/punches/${id}`,
        updatePunchDto,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data) {
        setPunch(response.data);
        setEditedPunch(response.data);
        setIsEditing(false);
      } else {
        throw new Error("Failed to update punch");
      }
    } catch (err: any) {
      console.error("Update error:", err);
      if (err.response) {
        setError(
          `Server error: ${err.response.status} - ${
            err.response.data?.message || "Unknown error"
          }`
        );
      } else if (err.request) {
        setError("Network error. Please check your connection.");
      } else {
        setError(err.message || "Failed to update punch. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && id) {
      fetchPunch();
    }
  }, [user, id]);

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {projectName || "Punch Details"}
          </Text>
          <View style={styles.placeholder} />
        </View>
        <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
      </SafeAreaView>
    );
  }

  if (error || !punch) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {projectName || "Punch Details"}
          </Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.content}>
          <Text style={styles.errorText}>{error || "Punch not found"}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchPunch}>
            <Text style={styles.retryText}>Tap to retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{projectName || "Punch Details"}</Text>
        <TouchableOpacity
          onPress={() => setIsEditing(!isEditing)}
          style={styles.editButton}
        >
          <Ionicons
            name={isEditing ? "close" : "pencil"}
            size={24}
            color="#333"
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.punchCard}>
          <Text style={styles.sectionTitle}>Punch Details</Text>

          <View style={styles.detailRow}>
            <Text style={styles.label}>Title</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={editedPunch.title}
                onChangeText={(text) =>
                  setEditedPunch({ ...editedPunch, title: text })
                }
                placeholder="Enter punch title"
              />
            ) : (
              <Text style={styles.value}>{punch.title}</Text>
            )}
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.label}>Description</Text>
            {isEditing ? (
              <TextInput
                style={[styles.input, styles.multilineInput]}
                value={editedPunch.description || ""}
                onChangeText={(text) =>
                  setEditedPunch({ ...editedPunch, description: text })
                }
                placeholder="Enter description"
                multiline
              />
            ) : (
              <Text style={styles.value}>
                {punch.description || "No description"}
              </Text>
            )}
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.label}>Status</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={editedPunch.status}
                onChangeText={(text) =>
                  setEditedPunch({ ...editedPunch, status: text })
                }
                placeholder="e.g., OPEN, CLOSED"
              />
            ) : (
              <Text style={styles.value}>{punch.status}</Text>
            )}
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.label}>Category</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={editedPunch.category || ""}
                onChangeText={(text) =>
                  setEditedPunch({ ...editedPunch, category: text })
                }
                placeholder="e.g., A, B, C, D"
              />
            ) : (
              <Text style={styles.value}>{punch.category || "N/A"}</Text>
            )}
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.label}>Project</Text>
            <Text style={styles.value}>{punch.project.name}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.label}>System</Text>
            <Text style={styles.value}>{punch.system?.name || "N/A"}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.label}>Image URL</Text>
            <Text style={styles.value}>{punch.image_url || "No image"}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.label}>Created By</Text>
            <Text style={styles.value}>{punch.created_by?.name}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.label}>Modified By</Text>
            <Text style={styles.value}>{punch.modified_by?.name}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.label}>Created At</Text>
            <Text style={styles.value}>{formatDateTime(punch.created_at)}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.label}>Updated At</Text>
            <Text style={styles.value}>{formatDateTime(punch.updated_at)}</Text>
          </View>

          {isEditing && (
            <TouchableOpacity style={styles.saveButton} onPress={saveChanges}>
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
          )}
        </View>
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
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },
  editButton: {
    padding: 5,
  },
  placeholder: {
    width: 24,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  punchCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginBottom: 20,
  },
  detailRow: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 5,
  },
  value: {
    fontSize: 16,
    color: "#666",
  },
  input: {
    fontSize: 16,
    color: "#333",
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    padding: 10,
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  saveButton: {
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  loader: {
    marginTop: 20,
  },
  errorText: {
    fontSize: 16,
    color: "red",
    textAlign: "center",
    marginTop: 20,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 40,
  },
  retryText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
});

export default PunchDetailsScreen;
