import AppButton from "@/components/AppButton";
import DcrTable from "@/components/DcrTable";
import { FontAwesome6 } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

const dcr = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.mainHeaderText}>Daily Call Records</Text>

      <AppButton
        onPress={() => {}}
        asLink={true}
        style={styles.button}
        link={"/pages/createDcr"}
      >
        <FontAwesome6 name="add" size={24} color={styles.popularCardText} />
        <Text style={[styles.buttonText, styles.popularCardText]}>
          Create DCR
        </Text>
      </AppButton>

      <DcrTable />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 15,
    padding: 16,
  },

  mainHeaderText: {
    fontWeight: "bold",
    fontSize: 18,
  },

  popularCardText: {
    color: "#8d96ffff",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    width: 140,
    backgroundColor: "#041097ff",
    marginBottom: 12,
  },
  buttonText: {
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default dcr;
