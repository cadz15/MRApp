import CustomTab from "@/components/CustomTab";
import { Tabs } from "expo-router";
import React from "react";

export default function TabLayout() {
  return (
    <Tabs tabBar={(props) => <CustomTab {...props} />}>
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          iconName: "home",
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Sales",
          iconName: "book-open",
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="dcr"
        options={{
          title: "DCR",
          iconName: "calendar",
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          iconName: "settings",
          headerShown: false,
        }}
      />
    </Tabs>
  );
}
