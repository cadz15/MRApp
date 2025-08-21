import AppButton from "@/components/AppButton";
import { useDB } from "@/context/DBProvider";
import { customers } from "@/OfflineDB/schema";
import { Picker } from "@react-native-picker/picker";
import { and, eq } from "drizzle-orm";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

const regionsData = ["Region 1", "Region 2", "Region 3"];

const addressesData = [
  {
    id: 1,
    region: "Region 1",
    address: "sample address",
  },
  {
    id: 2,
    region: "Region 1",
    address: "address 2",
  },
  {
    id: 3,
    region: "Region 2",
    address: "region2address",
  },
  {
    id: 4,
    region: "Region 3",
    address: "regionregion",
  },
];

const customersData = [
  {
    id: 1,
    addressId: 1,
    name: "juan 1 dela cruz",
  },
  {
    id: 1,
    addressId: 2,
    name: "juan 2 dela cruz",
  },
  {
    id: 1,
    addressId: 3,
    name: "asdas ",
  },
  {
    id: 1,
    addressId: 3,
    name: "juan ",
  },
  {
    id: 1,
    addressId: 4,
    name: "juan 4 dela cruz",
  },
];

const salesorder = () => {
  const [region, setRegion] = useState("");
  const [address, setAddress] = useState("");
  const [customer, setCustomer] = useState("");

  const [addressList, setAddressList] = useState<string[]>([]);
  const [customersList, setCustomersList] = useState<
    {
      id: number;
      name: string;
    }[]
  >([]);
  const [regionList, setRegionList] = useState<string[]>([]);

  const [isLoadingRegion, setIsLoadingRegion] = useState(false);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [isLoadingCustomer, setIsLoadingCustomer] = useState(false);

  const db = useDB();

  const getRegions = async () => {
    setIsLoadingRegion(true);
    const result = await db
      .select({ region: customers.region })
      .from(customers)
      .groupBy(customers.region); // ensures unique regions

    return result.map((r) => r.region);
  };

  const getAddresses = async () => {
    setIsLoadingAddress(true);
    const result = await db
      .select({ shortAddress: customers.shortAddress })
      .from(customers)
      .where(eq(customers.region, region))
      .groupBy(customers.shortAddress); // ensures unique shortAddress

    return result.map((r) => r.shortAddress);
  };

  const getCustomers = async () => {
    setIsLoadingCustomer(true);
    const result = await db
      .select({
        id: customers.id,
        name: customers.name,
      })
      .from(customers)
      .where(
        and(eq(customers.region, region), eq(customers.shortAddress, address))
      );

    return result;
  };

  const handleCreate = () => {
    if (region && address && customer) {
      router.push(`/salesorder/${customer}`);
    }
  };

  useEffect(() => {
    getRegions().then((regions) => {
      setRegionList(regions);
    });

    setIsLoadingRegion(false);
  }, []);

  useEffect(() => {
    if (region) {
      getAddresses().then((addresses) => {
        setAddressList(addresses);
      });
      setIsLoadingAddress(false);
    } else {
      setAddressList([]);
    }

    setCustomersList([]);
  }, [region]);

  useEffect(() => {
    if (address) {
      getCustomers().then((customers) => {
        console.log(customers);

        setCustomersList(customers);
      });
      setIsLoadingCustomer(false);
    } else {
      setCustomersList([]);
    }
  }, [address]);

  return (
    <View style={styles.container}>
      <View style={styles.cardContainer}>
        <Text style={styles.cardTitle}>Customers</Text>
        <Text style={styles.cardDescription}>Please select a customer.</Text>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Region</Text>
          <Picker
            selectedValue={region}
            onValueChange={(itemValue, itemIndex) => setRegion(itemValue)}
            style={styles.input}
            enabled={!isLoadingRegion}
          >
            {regionList ? (
              regionList?.map((region: string) => (
                <Picker.Item label={region} value={region} key={region} />
              ))
            ) : (
              <Picker.Item label={"Loading..."} value={0} key={0} />
            )}
          </Picker>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Address</Text>
          <Picker
            selectedValue={address}
            onValueChange={(itemValue, itemIndex) => setAddress(itemValue)}
            style={styles.input}
            enabled={!isLoadingAddress}
          >
            {addressList ? (
              addressList?.map((address: string) => (
                <Picker.Item key={address} label={address} value={address} />
              ))
            ) : (
              <Picker.Item label={"Loading..."} value={0} key={0} />
            )}
          </Picker>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Customer</Text>
          <Picker
            selectedValue={customer}
            onValueChange={(itemValue, itemIndex) => setCustomer(itemValue)}
            style={styles.input}
            enabled={!isLoadingCustomer}
          >
            {customersList ? (
              customersList?.map(
                (
                  customer: {
                    id: number;
                    name: string;
                  },
                  index: number
                ) => (
                  <Picker.Item
                    label={customer.name}
                    value={customer.id}
                    key={index}
                  />
                )
              )
            ) : (
              <Picker.Item label={"Loading..."} value={0} key={0} />
            )}
          </Picker>
        </View>

        <AppButton
          onPress={handleCreate}
          asLink={false}
          link={""}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Submit</Text>
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
  },
  cardContainer: {
    width: 400,
    backgroundColor: "#fff",
    padding: 8,
    borderRadius: 4,
  },
  cardTitle: {
    fontWeight: "bold",
    fontSize: 20,
    textAlign: "center",
  },
  cardDescription: {
    fontSize: 12,
    textAlign: "center",
    color: "#afaeaeff",
  },
  inputContainer: {
    marginTop: 8,
    gap: 4,
  },
  input: {
    backgroundColor: "#e6e5e5ff",
    borderRadius: 12,
    borderColor: "#dbdadaff",
    borderWidth: 1,
  },
  label: {
    fontWeight: "bold",
    fontSize: 14,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    width: "auto",
    backgroundColor: "#1F7FD8",
    marginVertical: 12,
  },
  buttonText: {
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 14,
    color: "#175c9cff",
  },
});
export default salesorder;
