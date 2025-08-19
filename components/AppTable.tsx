import { formattedCurrency } from "@/constants/Currency";
import { useDB } from "@/context/DBProvider";
import { customers } from "@/OfflineDB/schema";
import Ionicons from "@expo/vector-icons/Ionicons";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

type TableDataType = {
  orderId: number;
  total: number;
  customerId: number;
  customerName: string;
  dateSold: string;
};

type RenderPropType = {
  item: TableDataType;
  index: number;
};

const headers = ["Customer", "Date", "Total Sales"];

const AppTable = () => {
  const [salesOrders, setSalesOrders] = useState<any>([]);
  const [isRefreshing, setIsRefreshing] = useState(true);
  const db = useDB();

  async function loadSalesOrder() {
    const latestSalesOrder = await db
      .select({
        orderId: salesOrders.id,
        total: salesOrders.total,
        customerId: salesOrders.customerId,
        customerName: customers.name,
        dateSold: salesOrders.dateSold,
      })
      .from(customers);

    setSalesOrders(latestSalesOrder);
  }

  const renderItem = ({ item, index }: RenderPropType) => (
    <View style={styles.tableRow}>
      <Text
        style={[
          styles.tableBodyText,
          index !== salesOrders.length - 1 ? styles.tableBorderBottom : null,
        ]}
      >
        {item.customerName}
      </Text>
      <Text
        style={[
          styles.tableBodyText,
          index !== salesOrders.length - 1 ? styles.tableBorderBottom : null,
        ]}
      >
        {item.dateSold}
      </Text>
      <Text
        style={[
          styles.tableBodyText,
          index !== salesOrders.length - 1 ? styles.tableBorderBottom : null,
        ]}
      >
        {formattedCurrency(item.total)}
      </Text>
    </View>
  );

  useEffect(() => {
    if (isRefreshing) {
      loadSalesOrder();
      setIsRefreshing(false);
    }
  }, [isRefreshing]);

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
          <FlatList
            data={salesOrders}
            renderItem={renderItem}
            keyExtractor={(item) => item.orderId.toString()}
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
