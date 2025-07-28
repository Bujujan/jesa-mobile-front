import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, TouchableOpacity, View } from "react-native";

interface CustomNavbarProps {
  activeTab?: "home" | "add" | "notifications";
  onTabPress?: (tab: "home" | "add" | "notifications") => void;
}

export default function CustomNavbar({
  activeTab = "add",
  onTabPress,
}: CustomNavbarProps) {
  const handleTabPress = (tab: "home" | "add" | "notifications") => {
    onTabPress?.(tab);
  };

  return (
    <View style={styles.container}>
      <View style={styles.navbar}>
        {/* Home Tab */}
        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => handleTabPress("home")}
          activeOpacity={0.7}
        >
          <Ionicons
            name="home"
            size={24}
            color={activeTab === "home" ? "#0891b2" : "#6b7280"}
          />
        </TouchableOpacity>

        {/* Add Tab */}
        <TouchableOpacity
          style={[styles.tabButton, styles.addButton]}
          onPress={() => handleTabPress("add")}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.addButtonCircle,
              { backgroundColor: activeTab === "add" ? "#0891b2" : "#6b7280" },
            ]}
          >
            <Ionicons name="add" size={24} color="white" />
          </View>
          {activeTab === "add" && <View style={styles.activeIndicator} />}
        </TouchableOpacity>

        {/* Notifications Tab */}
        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => handleTabPress("notifications")}
          activeOpacity={0.7}
        >
          <Ionicons
            name="triangle-outline"
            size={24}
            color={activeTab === "notifications" ? "#0891b2" : "#6b7280"}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f8fafc",
    paddingBottom: 20,
    paddingTop: 10,
  },
  navbar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  tabButton: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  addButton: {
    alignItems: "center",
  },
  addButtonCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  activeIndicator: {
    position: "absolute",
    bottom: -15,
    width: 30,
    height: 3,
    backgroundColor: "#1f2937",
    borderRadius: 2,
  },
});
