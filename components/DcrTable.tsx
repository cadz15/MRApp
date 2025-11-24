import { getDcrTable } from "@/OfflineDB/dborm";
import { dcrTableType } from "@/OfflineDB/tableTypes";
import { sortByDcrDate } from "@/utils/sortDate";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const headers = [
  "Name",
  "Practice/Address",
  "Signature",
  "Remarks",
  "Date",
  "Sync Date",
];

function DcrTable() {
  const [search, setSearch] = useState("");
  const [deferedText, setDeferedText] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(true);
  const [dcrList, setDcrList] = useState<dcrTableType[] | null>(null);
  const [dcrFilteredList, setDcrFilteredList] = useState<dcrTableType[] | null>(
    null
  );
  const [salesOrders, setSalesOrders] = useState(null);

  const navigation = useNavigation();
  const focused = navigation.isFocused();

  const loadDcr = async () => {
    const res = sortByDcrDate(await getDcrTable());

    setDcrList(res);
    setDcrFilteredList(res);
  };

  const renderItem = ({ item, index }: any) => (
    <View style={styles.tableRow}>
      <Text
        style={[
          styles.tableBodyText,
          index !== (dcrFilteredList ? dcrFilteredList.length - 1 : 0)
            ? styles.tableBorderBottom
            : null,
          { color: "#036810ff" },
        ]}
      >
        {item.name}
      </Text>
      <Text
        style={[
          styles.tableBodyText,
          index !== (dcrFilteredList ? dcrFilteredList.length - 1 : 0)
            ? styles.tableBorderBottom
            : null,
        ]}
      >
        {item.practice}
      </Text>
      <Text
        style={[
          styles.tableBodyText,
          index !== (dcrFilteredList ? dcrFilteredList.length - 1 : 0)
            ? styles.tableBorderBottom
            : null,
        ]}
      >
        {item.signature ? "with Signature" : "-"}
      </Text>
      <Text
        style={[
          styles.tableBodyText,
          index !== (dcrFilteredList ? dcrFilteredList.length - 1 : 0)
            ? styles.tableBorderBottom
            : null,
        ]}
      >
        {item.remarks}
      </Text>
      <Text
        style={[
          styles.tableBodyText,
          index !== (dcrFilteredList ? dcrFilteredList.length - 1 : 0)
            ? styles.tableBorderBottom
            : null,
        ]}
      >
        {item.dcrDate}
      </Text>
      <Text
        style={[
          styles.tableBodyText,
          index !== (dcrFilteredList ? dcrFilteredList.length - 1 : 0)
            ? styles.tableBorderBottom
            : null,
        ]}
      >
        {item.syncDate}
      </Text>
    </View>
  );

  useEffect(() => {
    if (isRefreshing) {
      loadDcr();
      setIsRefreshing(false);
    }
  }, [isRefreshing, focused]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDeferedText(search);
    }, 500); // wait 500ms after user stops typing

    return () => {
      clearTimeout(handler); // clear on every new keystroke
    };
  }, [search]);

  useEffect(() => {
    console.log(search);

    if (deferedText.trim() !== "") {
      const searchItem =
        dcrList?.filter((dcr) => {
          return (
            dcr.name?.toLowerCase().includes(deferedText.toLowerCase()) ||
            dcr.dcrDate?.toLowerCase().includes(deferedText.toLowerCase())
          );
        }) ?? null;

      setDcrFilteredList(searchItem);
    } else {
      loadDcr();
      //   setDcrFilteredList(dcrList);
    }
  }, [deferedText]);

  return (
    <View style={[styles.container]}>
      <View>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={24} color="black" />
          <TextInput
            style={styles.searchTextBar}
            placeholder="Search by customer or date  "
            value={search}
            onChangeText={setSearch}
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
          <FlatList
            data={dcrFilteredList}
            renderItem={renderItem}
            keyExtractor={(item) => item?.id.toString()}
            refreshControl={
              <RefreshControl
                onRefresh={() => setIsRefreshing(true)}
                refreshing={isRefreshing}
              />
            }
          />
        </View>
      </View>
    </View>
  );
}

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
    height: 270,
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

export default DcrTable;
