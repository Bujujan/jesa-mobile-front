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

// Define the Project type based on your backend's Project entity
interface Project {
  uuid: string;
  name: string;
  description: string;
  created_at: string;
}

const HomeScreen = () => {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false);
  const router = useRouter();

  const fetchAssignedProjects = async (isRefreshing = false) => {
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
        `${process.env.EXPO_PUBLIC_API_URL}/projectuser/${user.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("API Response:", response.data);

      if (response.data.success) {
        setProjects(response.data.projects || []);
      } else {
        throw new Error(response.data.message || "Failed to fetch projects");
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
        setError(err.message || "Failed to fetch projects. Please try again.");
      }
      setHasInitiallyLoaded(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    fetchAssignedProjects(true);
  }, [user, getToken]);

  useEffect(() => {
    if (user && !hasInitiallyLoaded) {
      fetchAssignedProjects();
    }
  }, [user]);

  const formatLastModified = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));

    if (diffInHours < 1) return "Less than an hour ago";
    if (diffInHours < 24) return `${diffInHours} hrs ago`;
    return `${Math.floor(diffInHours / 24)} days ago`;
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
              placeholder="search for a project"
              placeholderTextColor="#999"
            />
          </View>
          <TouchableOpacity style={styles.settingsButton}>
            <Ionicons name="settings-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>
        <Text style={styles.sectionTitle}>Assigned Projects</Text>
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
            placeholder="search for a project"
            placeholderTextColor="#999"
          />
        </View>
        <TouchableOpacity style={styles.settingsButton}>
          <Ionicons name="settings-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Assigned Projects</Text>

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
            onPress={() => fetchAssignedProjects()}
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
          {projects.length === 0 ? (
            <Text style={styles.noProjectsText}>No projects assigned</Text>
          ) : (
            projects.map((project, index) => (
              <TouchableOpacity
                key={`${project.uuid}-${index}`}
                style={styles.projectCard}
                onPress={() =>
                  router.push({
                    pathname: "/project/[id]",
                    params: { id: project.uuid, projectName: project.name },
                  })
                }
              >
                <View style={styles.projectInfo}>
                  <Text style={styles.projectName}>{project.name}</Text>
                  <Text style={styles.projectDescription}>
                    {project.description}
                  </Text>
                  <Text style={styles.lastModified}>
                    Last modified: {formatLastModified(project.created_at)}
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
  projectCard: {
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
  projectInfo: {
    flex: 1,
  },
  projectName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 5,
  },
  projectDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 15,
  },
  lastModified: {
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
  noProjectsText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 20,
  },
});

export default HomeScreen;
