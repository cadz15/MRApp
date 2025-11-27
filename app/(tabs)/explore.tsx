import AppButton from "@/components/AppButton";
import AppTable from "@/components/AppTable";
import { getDB } from "@/OfflineDB/db";
import { items, salesOrderItems, salesOrders } from "@/OfflineDB/schema";
import { getMedRepData } from "@/OfflineDB/sync";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { and, count, desc, eq, like, sum } from "drizzle-orm";
import { Link } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

interface AnalyticsData {
  monthlySales: number;
  monthlySalesMonth: string;
  monthlyConversions: number;
  popularProductType: string;
}

export default function TabTwoScreen() {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    monthlySales: 0,
    monthlySalesMonth: "",
    monthlyConversions: 0,
    popularProductType: "-",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    try {
      const db = await getDB();
      const medrep = await getMedRepData();

      if (!medrep || medrep.length === 0) {
        console.warn("No medical representative data found");
        return;
      }

      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.toLocaleString("en-US", {
        month: "short",
      });
      const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      const fullMonthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];

      // Get monthly sales for current month (using "Oct 2025" format)
      const monthlySalesResult = await db
        .select({ total: sum(salesOrders.total) })
        .from(salesOrders)
        .where(
          and(
            eq(salesOrders.medicalRepresentativeId, medrep[0].onlineId),
            like(salesOrders.dateSold, `${currentMonth}%${currentYear}`)
          )
        );

      const monthlySales = parseFloat(monthlySalesResult[0]?.total || "0");

      // Get monthly conversions (unique customers for current month)
      const monthlyConversionsResult = await db.select({ count: count() }).from(
        db
          .select()
          .from(salesOrders)
          .where(
            and(
              eq(salesOrders.medicalRepresentativeId, medrep[0].onlineId),
              like(salesOrders.dateSold, `${currentMonth}%${currentYear}`)
            )
          )
          .groupBy(salesOrders.customerId)
          .as("distinct_customers")
      );

      const monthlyConversions = monthlyConversionsResult[0]?.count || 0;

      // Get popular product type (all time)
      const popularProductTypeResult = await db
        .select({
          product_type: items.productType,
          total_quantity: sum(salesOrderItems.quantity),
        })
        .from(salesOrderItems)
        .innerJoin(
          salesOrders,
          eq(salesOrderItems.salesOrderOfflineId, salesOrders.id)
        )
        .innerJoin(items, eq(salesOrderItems.itemId, items.id))
        .where(eq(salesOrders.medicalRepresentativeId, medrep[0].onlineId))
        .groupBy(items.productType)
        .orderBy(desc(sum(salesOrderItems.quantity)))
        .limit(1);

      const popularProductType =
        popularProductTypeResult[0]?.product_type || "-";

      // Get current month index for full month name
      const currentMonthIndex = currentDate.getMonth();
      const currentFullMonthName = fullMonthNames[currentMonthIndex];

      setAnalytics({
        monthlySales,
        monthlySalesMonth: currentFullMonthName,
        monthlyConversions,
        popularProductType,
      });
    } catch (error) {
      console.error("Error loading analytics data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.sidebar}>
        <Link
          href="/pages/createcustomer"
          style={[styles.buttonNav, styles.borderBottom]}
        >
          <Text style={styles.buttonNavText}>Create Customer</Text>
        </Link>
        <Link
          href={"/pages/medRepAnalytics"}
          style={[styles.buttonNav, styles.borderBottom]}
        >
          <Text style={styles.buttonNavText}>Report</Text>
        </Link>
        <Link href={"/pages/customerAnalytics"} style={styles.buttonNav}>
          <Text style={styles.buttonNavText}>Customer Analytics</Text>
        </Link>
      </View>
      <View style={styles.main}>
        <Text style={styles.mainHeaderText}>Sale Orders</Text>
        <View style={styles.mainCardContainer}>
          <View style={[styles.mainCard, styles.salesCard]}>
            <Text style={[styles.salesCardText]}>Monthly Sales</Text>
            <Text style={[styles.salesCardText, styles.cardNumberText]}>
              ₱ {loading ? "..." : analytics.monthlySales.toLocaleString()}
            </Text>
            <Text
              style={[styles.conversionCardText, styles.cardNumberDescription]}
            >
              {loading ? "Loading..." : analytics.monthlySalesMonth}
            </Text>
          </View>
          <View style={[styles.mainCard, styles.conversionCard]}>
            <Text style={[styles.conversionCardText]}>Monthly Conversions</Text>
            <View>
              <Text style={[styles.conversionCardText, styles.cardNumberText]}>
                {loading ? "..." : analytics.monthlyConversions}
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
              {loading ? "..." : analytics.popularProductType}
            </Text>
          </View>
        </View>

        <AppButton
          onPress={() => {}}
          asLink={true}
          style={styles.button}
          link={"/pages/salesorder?fromMr=1"}
        >
          <FontAwesome6 name="add" size={24} color={styles.popularCardText} />
          <Text style={[styles.buttonText, styles.popularCardText]}>
            Create S.O.
          </Text>
        </AppButton>

        <AppTable />
      </View>
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
    height: 110,
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
