import { HapticTab } from "@/components/HapticTab";
import { IconSymbol } from "@/components/ui/IconSymbol";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Tabs } from "expo-router";
import React from "react";
import { Platform, StyleSheet, View } from "react-native";

// Custom Add Button Component
const AddButton = ({ color, focused }: { color: string; focused: boolean }) => (
  <View style={styles.addButtonContainer}>
    <View
      style={[
        styles.addButton,
        { backgroundColor: focused ? "#007AFF" : "#007AFF" },
      ]}
    >
      <IconSymbol size={28} name="plus" color="white" />
    </View>
  </View>
);

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#007AFF",
        tabBarInactiveTintColor: "#999",
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: {
          ...Platform.select({
            ios: {
              position: "absolute",
            },
            default: {},
          }),
          backgroundColor: "white",
          borderTopWidth: 1,
          borderTopColor: "#E5E5E5",
          height: 90,
          paddingBottom: Platform.OS === "ios" ? 25 : 15,
          paddingTop: 15,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol
              size={24}
              name="house.fill"
              color={focused ? "#007AFF" : "#999"}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="add"
        options={{
          title: "",
          tabBarIcon: ({ color, focused }) => (
            <AddButton color={color} focused={focused} />
          ),
          tabBarButton: (props) => (
            <HapticTab {...props} style={[props.style, styles.addTabButton]} />
          ),
        }}
      />

      <Tabs.Screen
        name="explore"
        options={{
          title: "Alerts",
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol
              size={24}
              name="triangle.fill"
              color={focused ? "#007AFF" : "#999"}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  addButtonContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: -10,
  },
  addButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#007AFF",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  addTabButton: {
    top: -10,
  },
});
