import { IconSymbol } from "@/components/ui/IconSymbol"; // Custom Icon component
import { Tabs } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#fff", // Active icon/text color
        tabBarInactiveTintColor: "#257756", // Inactive icon/text color
        tabBarShowLabel: false, // Hide labels if you only want icons
        tabBarStyle: styles.tabBarStyle,
        tabBarItemStyle: styles.tabBarItemStyle,
        tabBarActiveBackgroundColor: "#257756", // Background color for active tab
        tabBarBackground: () => (
          <View style={styles.tabBarBackground}>
            {/* You can apply gradient or background images here */}
          </View>
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="paperplane.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarStyle: {
    position: "absolute",
    height: 60,
    bottom: 10,
    marginHorizontal: "20%",
    width: "auto",
    borderRadius: 30, // Rounds the entire tab bar container
    backgroundColor: "#5EB492",
    borderTopWidth: 0,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
  },

  tabBarItemStyle: {
    paddingVertical: 5,
    margin: 5,
    borderRadius: 30, // Ensures the tab item is rounded
  },

  tabBarBackground: {
    borderRadius: 30, // Rounds the background to match the tab bar
    overflow: "hidden", // Prevents overflow of any content
    backgroundColor: "#fff", // Background color for tab bar
  },
});
