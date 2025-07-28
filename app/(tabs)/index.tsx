import { useAuth, useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
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

// Define the Project type based on your backend's Project entity
interface Project {
  uuid: string;
  name: string;
  description: string;
  created_at: string;
}

const HomeScreen = () => {
  const { user } = useUser(); // Get the current user from Clerk
  const { getToken } = useAuth(); // Get the token from useAuth
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch projects assigned to the logged-in user
  const fetchAssignedProjects = async () => {
    if (!user) {
      setError("User not authenticated");
      setLoading(false);
      return;
    }

    try {
      // Retrieve the Clerk JWT token
      const token = await getToken();
      if (!token) {
        throw new Error("No authentication token found");
      }

      // Make API call to fetch project-user associations
      const response = await axios.get(
        `http://192.168.11.109:3000/projectuser/${user.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Extract projects from the project-user associations
      const assignedProjects = response.data.project
        ? [response.data.project]
        : [];
      setProjects(assignedProjects);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch projects. Please try again.");
      setLoading(false);
      console.error(err);
    }
  };

  // Fetch projects when the component mounts or user changes
  useEffect(() => {
    fetchAssignedProjects();
  }, [user, getToken]);

  // Function to format the last modified date
  const formatLastModified = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));

    if (diffInHours < 1) return "Less than an hour ago";
    if (diffInHours < 24) return `${diffInHours} hrs ago`;
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Search and Settings */}
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

      {/* Main Content */}
      <Text style={styles.sectionTitle}>Assigned Projects</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Project Cards */}
          {projects.length === 0 ? (
            <Text style={styles.noProjectsText}>No projects assigned</Text>
          ) : (
            projects.map((project) => (
              <TouchableOpacity key={project.uuid} style={styles.projectCard}>
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
  },
  noProjectsText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 20,
  },
});

export default HomeScreen;
