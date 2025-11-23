import AppButton from "@/components/AppButton";
import { useDB } from "@/context/DBProvider";
import { customers } from "@/OfflineDB/schema";
import { eq } from "drizzle-orm";
import * as Linking from "expo-linking";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const salesorder = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<number | null>(null);
  const [dataFromProductApp, setdataFromProductApp] = useState("");
  const [customersList, setCustomersList] = useState<
    {
      id: number;
      name: string;
      shortAddress: string;
    }[]
  >([]);
  const [filteredCustomers, setFilteredCustomers] = useState<
    {
      id: number;
      name: string;
      shortAddress: string;
    }[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);

  const url = Linking.useLinkingURL();
  const { fromMr } = useLocalSearchParams();
  const db = useDB();

  const getAllCustomers = async () => {
    setIsLoading(true);
    try {
      const result = await db
        .select({
          id: customers.id,
          name: customers.name,
          shortAddress: customers.shortAddress,
        })
        .from(customers)
        .where(eq(customers.deletedAt, ""))
        .orderBy(customers.name);

      setCustomersList(result);
      setFilteredCustomers(result);
    } catch (error) {
      console.error("Error loading customers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === "") {
      setFilteredCustomers(customersList);
    } else {
      const filtered = customersList.filter((customer) =>
        customer.name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredCustomers(filtered);
    }
  };

  const handleCreate = () => {
    if (selectedCustomer) {
      router.push(`/salesorder/${selectedCustomer}?ids=${dataFromProductApp}`);
    }
  };

  const handleCustomerSelect = (customerId: number) => {
    setSelectedCustomer(customerId);
  };

  const renderCustomerItem = ({
    item,
  }: {
    item: { id: number; name: string; shortAddress: string };
  }) => (
    <TouchableOpacity
      style={[
        styles.customerItem,
        selectedCustomer === item.id && styles.selectedCustomerItem,
      ]}
      onPress={() => handleCustomerSelect(item.id)}
    >
      <Text style={styles.customerName}>{item.name}</Text>
      <Text style={styles.customerAddress}>{item.shortAddress}</Text>
    </TouchableOpacity>
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>
        {searchQuery
          ? "No customers found matching your search"
          : "No customers available"}
      </Text>
    </View>
  );

  useEffect(() => {
    getAllCustomers();
  }, []);

  useEffect(() => {
    if (url && fromMr !== "1") {
      const { queryParams } = Linking.parse(url);
      console.log(queryParams);
      setdataFromProductApp(queryParams?.ids);
    }
  }, [url]);

  return (
    <View style={styles.container}>
      {customersList.length <= 0 && !isLoading && (
        <Text style={styles.errorText}>No Data! Please Sync first.</Text>
      )}

      <View style={styles.cardContainer}>
        <Text style={styles.cardTitle}>Select Customer</Text>
        <Text style={styles.cardDescription}>
          Search and select a customer from the list.
        </Text>

        {/* Search Box */}
        <View style={styles.searchContainer}>
          <Text style={styles.label}>Search Customer</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Type customer name..."
            value={searchQuery}
            onChangeText={handleSearch}
            clearButtonMode="while-editing"
          />
        </View>

        {/* Customers List */}
        <View style={styles.listContainer}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#1F7FD8" />
              <Text style={styles.loadingText}>Loading customers...</Text>
            </View>
          ) : (
            <FlatList
              data={filteredCustomers}
              renderItem={renderCustomerItem}
              keyExtractor={(item) => item.id.toString()}
              style={styles.flatList}
              contentContainerStyle={styles.flatListContent}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={renderEmptyList}
              initialNumToRender={20}
              maxToRenderPerBatch={20}
              windowSize={10}
            />
          )}
        </View>

        <AppButton
          onPress={handleCreate}
          asLink={false}
          link={""}
          style={[styles.button, !selectedCustomer && styles.buttonDisabled]}
          disabled={!selectedCustomer}
        >
          <Text style={styles.buttonText}>
            {selectedCustomer ? "Continue to Sales Order" : "Select a Customer"}
          </Text>
        </AppButton>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  cardContainer: {
    width: "90%",
    maxWidth: 600,
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontWeight: "bold",
    fontSize: 20,
    textAlign: "center",
    marginBottom: 4,
    color: "#1e293b",
  },
  cardDescription: {
    fontSize: 14,
    textAlign: "center",
    color: "#64748b",
    marginBottom: 20,
  },
  searchContainer: {
    marginBottom: 16,
  },
  label: {
    fontWeight: "bold",
    fontSize: 14,
    color: "#374151",
    marginBottom: 8,
  },
  searchInput: {
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    borderColor: "#e2e8f0",
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  listContainer: {
    height: 300,
    marginBottom: 16,
  },
  flatList: {
    flex: 1,
  },
  flatListContent: {
    flexGrow: 1,
  },
  customerItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    backgroundColor: "#fff",
  },
  selectedCustomerItem: {
    backgroundColor: "#dbeafe",
    borderLeftWidth: 4,
    borderLeftColor: "#1F7FD8",
  },
  customerName: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#1e293b",
    marginBottom: 4,
  },
  customerAddress: {
    fontSize: 14,
    color: "#64748b",
  },
  selectedContainer: {
    backgroundColor: "#f0f9ff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#bae6fd",
  },
  selectedLabel: {
    fontSize: 12,
    color: "#0369a1",
    fontWeight: "600",
    marginBottom: 4,
  },
  selectedCustomerInfo: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1e293b",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    width: "auto",
    backgroundColor: "#1F7FD8",
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonDisabled: {
    backgroundColor: "#9ca3af",
  },
  buttonText: {
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
    color: "#fff",
  },
  errorText: {
    color: "#dc2626",
    textAlign: "center",
    marginBottom: 16,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    color: "#64748b",
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    color: "#64748b",
    fontSize: 14,
    textAlign: "center",
  },
});

export default salesorder;
