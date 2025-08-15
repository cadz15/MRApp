import Ionicons from "@expo/vector-icons/Ionicons";
import React from "react";
import { FlatList, StyleSheet, Text, TextInput, View } from "react-native";

const data = [
  {
    customer: "Dra. Rosa Roso",
    date: "June 1, 1990",
    sales: 1000,
  },
  {
    customer: "Dra. Rosa Roso",
    date: "June 1, 1990",
    sales: 1000,
  },
  {
    customer: "Dra. Rosa Roso",
    date: "June 1, 1990",
    sales: 1000,
  },
  {
    customer: "Dra. Rosa Roso",
    date: "June 1, 1990",
    sales: 1000,
  },
  {
    customer: "Dra. Rosa Roso",
    date: "June 1, 1990",
    sales: 1000,
  },
  {
    customer: "Dra. Rosa Roso",
    date: "June 1, 1990",
    sales: 1000,
  },
];

const headers = ["Customer", "Date", "Total Sales"];

const AppTable = () => {
  const renderItem = ({ item, index }) => (
    <View style={styles.tableRow}>
      <Text
        style={[
          styles.tableBodyText,
          index !== data.length - 1 ? styles.tableBorderBottom : null,
        ]}
      >
        {item.customer}
      </Text>
      <Text
        style={[
          styles.tableBodyText,
          index !== data.length - 1 ? styles.tableBorderBottom : null,
        ]}
      >
        {item.date}
      </Text>
      <Text
        style={[
          styles.tableBodyText,
          index !== data.length - 1 ? styles.tableBorderBottom : null,
        ]}
      >
        {item.sales}
      </Text>
    </View>
  );

  return (
    <View style={[styles.container]}>
      <View>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={24} color="black" />
          <TextInput
            style={styles.searchTextBar}
            placeholder="Search by customer, date or total sold "
          />
        </View>
      </View>
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          {headers.map((header, index) => (
            <Text
              key={index}
              style={[
                styles.tableHeaderText,
                index !== headers.length - 1 ? styles.tableBorderRight : null,
              ]}
            >
              {header}
            </Text>
          ))}
        </View>
        <View style={styles.tableBody}>
          <FlatList data={data} renderItem={renderItem} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 5,
    marginBottom: 50,
  },
  searchContainer: {
    backgroundColor: "#ecececff",
    marginBottom: 12,
    borderRadius: 4,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  searchTextBar: {
    flex: 1,
  },
  table: {
    borderRadius: 5,
  },
  tableHeader: {
    backgroundColor: "#DFDDDD",
    borderTopRightRadius: 5,
    borderTopLeftRadius: 5,
    flexDirection: "row",
    borderBottomWidth: 1,
  },
  tableBorderRight: {
    borderRightWidth: 1,
    borderColor: "#afaeaeff",
  },
  tableBorderBottom: {
    borderBottomWidth: 1,
    borderColor: "#afaeaeff",
  },
  tableHeaderText: {
    flex: 1,
    padding: 10,
    fontWeight: "bold",
    minWidth: 100,
    flexWrap: "wrap",
  },
  tableBody: {
    borderWidth: 1,
    flex: 1,
  },
  tableRow: {
    flexDirection: "row",
  },
  tableBodyText: {
    flex: 1,
    padding: 10,
    minWidth: 100,
    flexWrap: "wrap",
  },
});

export default AppTable;
