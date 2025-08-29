import { useAuth, useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
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
  created_by: { id: string };
  modified_by: { id: string };
  system?: { id: string; name: string };
  created_at: string;
  updated_at: string;
}

const PunchesScreen = () => {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [punches, setPunches] = useState<Punch[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false);
  const router = useRouter();

  const fetchOpenPunches = async (isRefreshing = false) => {
    if (!user) {
      setError("User not authenticated");
      return;
    }

    try {
      if (isRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const token = await getToken();
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_API_URL}/punches/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            status: "OPEN",
            createdBy: user.id, // <-- explicitly filter by created_by
          },
        }
      );

      console.log("API Response:", response.data);

      if (response.data) {
        setPunches(response.data || []);
      } else {
        throw new Error("Failed to fetch punches");
      }

      setHasInitiallyLoaded(true);
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
        setError(err.message || "Failed to fetch punches. Please try again.");
      }
      setHasInitiallyLoaded(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    fetchOpenPunches(true);
  }, [user, getToken]);

  useEffect(() => {
    if (user && !hasInitiallyLoaded) {
      fetchOpenPunches();
    }
  }, [user]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  if (loading && !hasInitiallyLoaded) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.searchContainer}>
            <Ionicons
              name="search"
              size={20}
              color="#999"
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="search for a punch"
              placeholderTextColor="#999"
            />
          </View>
          <TouchableOpacity style={styles.settingsButton}>
            <Ionicons name="settings-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>
        <Text style={styles.sectionTitle}>Open Punches</Text>
        <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color="#999"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="search for a punch"
            placeholderTextColor="#999"
          />
        </View>
        <TouchableOpacity style={styles.settingsButton}>
          <Ionicons name="settings-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Open Punches</Text>

      {error ? (
        <ScrollView
          style={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => fetchOpenPunches()}
          >
            <Text style={styles.retryText}>Tap to retry</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {punches.length === 0 ? (
            <Text style={styles.noPunchesText}>No open punches</Text>
          ) : (
            punches.map((punch) => (
              <TouchableOpacity
                key={punch.uuid}
                style={styles.punchCard}
                onPress={() =>
                  router.push({
                    pathname: "/punch/[id]",
                    params: { id: punch.uuid, projectName: punch.project.name },
                  })
                }
              >
                <View style={styles.punchInfo}>
                  <Text style={styles.punchTitle}>{punch.title}</Text>
                  <Text style={styles.punchDetails}>
                    Project: {punch.project.name}
                  </Text>
                  <Text style={styles.punchStatus}>
                    Created: {formatDate(punch.created_at)}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}
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
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginRight: 15,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  settingsButton: {
    padding: 5,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginBottom: 20,
    marginTop: 10,
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
  punchInfo: {
    flex: 1,
  },
  punchTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 5,
  },
  punchDetails: {
    fontSize: 14,
    color: "#666",
    marginBottom: 15,
  },
  punchStatus: {
    fontSize: 12,
    color: "#999",
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
  noPunchesText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 20,
  },
});

export default PunchesScreen;
