import AppButton from "@/components/AppButton";
import { Picker } from "@react-native-picker/picker";
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

  const [addressList, setAddressList] = useState([]);
  const [customersList, setCustomersList] = useState([]);

  const handleCreate = () => {
    if (region && address && customer) {
      router.push(`/salesorder/${customer}`);
    }
  };

  useEffect(() => {
    if (region) {
      setAddressList(
        addressesData.filter((address) => address.region === region)
      );
    } else {
      setAddressList([]);
    }
  }, [region]);

  useEffect(() => {
    if (address) {
      setCustomersList(
        customersData.filter((customer) => customer.addressId === address)
      );
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
          >
            {regionsData.map((region) => (
              <Picker.Item label={region} value={region} key={region} />
            ))}
          </Picker>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Address</Text>
          <Picker
            selectedValue={address}
            onValueChange={(itemValue, itemIndex) => setAddress(itemValue)}
            style={styles.input}
          >
            {addressList.map((address) => (
              <Picker.Item
                key={address.id}
                label={address.address}
                value={address.id}
              />
            ))}
          </Picker>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Customer</Text>
          <Picker
            selectedValue={customer}
            onValueChange={(itemValue, itemIndex) => setCustomer(itemValue)}
            style={styles.input}
          >
            {customersList.map((customer, index) => (
              <Picker.Item
                label={customer.name}
                value={customer.id}
                key={index}
              />
            ))}
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
