import AppButton from "@/components/AppButton";
import AppTable from "@/components/AppTable";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function TabTwoScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.sidebar}>
        <TouchableOpacity style={[styles.buttonNav, styles.borderBottom]}>
          <Text style={styles.buttonNavText}>Create Sales Order</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.buttonNav, styles.borderBottom]}>
          <Text style={styles.buttonNavText}>Sales List</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.buttonNav, styles.borderBottom]}>
          <Text style={styles.buttonNavText}>Report</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buttonNav}>
          <Text style={styles.buttonNavText}>S.O. Notifications</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.main}>
        <Text style={styles.mainHeaderText}>Sale Orders</Text>
        <View style={styles.mainCardContainer}>
          <View style={[styles.mainCard, styles.salesCard]}>
            <Text style={[styles.salesCardText]}>Daily Sales</Text>
            <Text style={[styles.salesCardText, styles.cardNumberText]}>
              ₱ 20,000.00
            </Text>
          </View>
          <View style={[styles.mainCard, styles.conversionCard]}>
            <Text style={[styles.conversionCardText]}>Daily Conversions</Text>
            <View>
              <Text style={[styles.conversionCardText, styles.cardNumberText]}>
                1
              </Text>
              <Text
                style={[
                  styles.conversionCardText,
                  styles.cardNumberDescription,
                ]}
              >
                Doctors/Hospitals
              </Text>
            </View>
          </View>
          <View style={[styles.mainCard, styles.popularCard]}>
            <Text style={[styles.popularCardText]}>Popular Product Type</Text>
            <Text style={[styles.popularCardText, styles.cardNumberText]}>
              Exclusive
            </Text>
          </View>
        </View>

        <AppButton
          onPress={() => {}}
          asLink={true}
          style={styles.button}
          link={"/pages/salesorder"}
        >
          <FontAwesome6 name="add" size={24} color={styles.popularCardText} />
          <Text style={[styles.buttonText, styles.popularCardText]}>
            Create S.O.
          </Text>
        </AppButton>

        <AppTable />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    gap: 15,
    padding: 16,
  },
  sidebar: {
    backgroundColor: "#fff",
    width: 200,
    borderRadius: 15,
    height: 150,
    padding: 10,
  },
  main: { flex: 1, flexDirection: "column", gap: 10 },
  buttonNav: {
    padding: 5,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: "#B4B1B1",
  },
  buttonNavText: {
    fontWeight: "bold",
    paddingHorizontal: 10,
  },
  mainHeaderText: {
    fontWeight: "bold",
    fontSize: 18,
  },
  mainCardContainer: {
    flexDirection: "row",
    gap: 10,
    marginVertical: 12,
  },
  mainCard: {
    width: "32%",
    padding: 10,
    borderRadius: 5,
    backgroundColor: "#fff",
    justifyContent: "space-between",
  },
  cardNumberText: {
    fontWeight: "bold",
    fontSize: 26,
    textAlign: "right",
  },
  cardNumberDescription: {
    fontWeight: "bold",
    fontSize: 14,
    textAlign: "right",
  },
  salesCard: {
    backgroundColor: "#FFD85E",
  },
  salesCardText: {
    color: "#684F00",
  },
  conversionCard: {
    backgroundColor: "#6CD9AE",
  },
  conversionCardText: {
    color: "#015835",
  },
  popularCard: {
    backgroundColor: "#8BAFFF",
  },
  popularCardText: {
    color: "#030D7B",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    width: 140,
    backgroundColor: "#1F7FD8",
    marginBottom: 12,
  },
  buttonText: {
    fontWeight: "bold",
    fontSize: 16,
  },
});
