// app/customeranalytics/[id].tsx
import { routes } from "@/constants/Routes";
import { getMedRepData } from "@/OfflineDB/sync";
import axios from "axios";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

interface Statistics {
  total_purchase: number;
  most_purchased_type: string;
  total_orders: number;
  current_orders: number;
}

interface ProductTypeData {
  product_type: string;
  quantity: number;
}

interface SalesTrendData {
  date: string;
  order_count: number;
  total_sales: number;
}

interface ProductPurchaseTrend {
  products: Array<{
    id: number;
    brand_name: string;
    generic_name: string;
    monthly_data: number[];
    total_quantity: number;
    trends: string[];
  }>;
  year: number;
}

interface SalesOrderItem {
  id: number;
  item: {
    brand_name: string;
    generic_name: string;
  };
  quantity: string;
  total: number;
}

interface SalesOrder {
  id: number;
  sales_order_number: string;
  date_sold: string;
  total: string;
  status: string;
  saleItems: SalesOrderItem[];
}

interface CustomerAnalyticsData {
  statistics: Statistics;
  productTypeData: ProductTypeData[];
  salesTrendData: SalesTrendData[];
  currentSalesOrders: SalesOrder[];
  historySalesOrders: SalesOrder[];
  productPurchaseTrend: ProductPurchaseTrend;
}

export default function CustomerAnalytics() {
  const { id } = useLocalSearchParams();
  const [analytics, setAnalytics] = useState<CustomerAnalyticsData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    loadCustomerAnalytics();
  }, [id, selectedYear]);

  const loadCustomerAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const medrep = await getMedRepData();
      if (!medrep || medrep.length === 0) {
        throw new Error("Medical representative data not found");
      }

      const response = await axios
        .get(routes.customerAnalytics?.replace("{id}", id as string), {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            "X-API-KEY": medrep[0]?.apiKey,
            "X-API-APP-KEY": medrep[0]?.salesOrderAppId,
          },
          params: {
            year: selectedYear,
            period: 365, // Get data for the whole year
          },
        })
        .then((response) => {
          setAnalytics(response.data.data);
        });
    } catch (err: any) {
      console.error("Error loading customer analytics:", err);
      setError(
        err.response?.data?.message || "Failed to load customer analytics"
      );
    } finally {
      setLoading(false);
    }
  };

  const StatsCard = ({
    title,
    value,
    subtitle,
    color,
  }: {
    title: string;
    value: string;
    subtitle: string;
    color: string;
  }) => (
    <View style={[styles.statsCard, { borderLeftColor: color }]}>
      <Text style={styles.statsValue}>{value}</Text>
      <Text style={styles.statsTitle}>{title}</Text>
      <Text style={styles.statsSubtitle}>{subtitle}</Text>
    </View>
  );

  const YearSelector = () => {
    const currentYear = new Date().getFullYear();
    const years = [
      currentYear - 10,
      currentYear - 9,
      currentYear - 8,
      currentYear - 7,
      currentYear - 6,
      currentYear - 5,
      currentYear - 4,
      currentYear - 3,
      currentYear - 2,
      currentYear - 1,
      currentYear,
      currentYear + 1,
    ];

    return (
      <View style={styles.yearSelector}>
        {years.map((year) => (
          <TouchableOpacity
            key={year}
            style={[
              styles.yearButton,
              selectedYear === year && styles.yearButtonActive,
            ]}
            onPressIn={() => setSelectedYear(year)}
          >
            <Text
              style={[
                styles.yearButtonText,
                selectedYear === year && styles.yearButtonTextActive,
              ]}
            >
              {year}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1F7FD8" />
        <Text style={styles.loadingText}>Loading customer analytics...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={loadCustomerAnalytics}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!analytics) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No analytics data available</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Customer Analytics</Text>
        <YearSelector />
      </View>

      {/* Key Statistics */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.statsScroll}
      >
        <View style={styles.statsRow}>
          <StatsCard
            title="Total Purchase"
            value={`₱${analytics?.statistics?.total_purchase.toLocaleString()}`}
            subtitle="All time revenue"
            color="#4ade80"
          />
          <StatsCard
            title="Total Orders"
            value={analytics?.statistics?.total_orders.toString()}
            subtitle="Completed orders"
            color="#3b82f6"
          />
          <StatsCard
            title="Current Orders"
            value={analytics?.statistics?.current_orders.toString()}
            subtitle="Pending orders"
            color="#f59e0b"
          />
          <StatsCard
            title="Popular Category"
            value={analytics?.statistics?.most_purchased_type}
            subtitle="Most purchased type"
            color="#ef4444"
          />
        </View>
      </ScrollView>

      {/* Product Type Distribution */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Product Type Distribution</Text>
        <View style={styles.distributionContainer}>
          {analytics?.productTypeData?.map((productType, index) => (
            <View
              key={productType.product_type}
              style={styles.distributionItem}
            >
              <View style={styles.distributionHeader}>
                <Text style={styles.distributionName}>
                  {productType.product_type}
                </Text>
                <Text style={styles.distributionQuantity}>
                  {productType.quantity} units
                </Text>
              </View>
              <View style={styles.distributionBar}>
                <View
                  style={[
                    styles.distributionFill,
                    {
                      width: `${
                        (productType.quantity /
                          Math.max(
                            ...analytics?.productTypeData?.map(
                              (p) => p.quantity
                            )
                          )) *
                        100
                      }%`,
                      backgroundColor: [
                        "#4ade80",
                        "#3b82f6",
                        "#f59e0b",
                        "#ef4444",
                        "#8b5cf6",
                      ][index % 5],
                    },
                  ]}
                />
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Product Purchase Trend */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Product Purchase Trend - {selectedYear}
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.trendContainer}>
            {analytics?.productPurchaseTrend?.products
              .slice(0, 5)
              .map((product, productIndex) => (
                <View key={product.id} style={styles.productTrend}>
                  <Text style={styles.productName}>{product.brand_name}</Text>
                  <Text style={styles.productGeneric}>
                    {product.generic_name}
                  </Text>
                  <View style={styles.monthlyBars}>
                    {product.monthly_data.map((quantity, monthIndex) => (
                      <View key={monthIndex} style={styles.monthBar}>
                        <View
                          style={[
                            styles.quantityBar,
                            {
                              height: Math.max(
                                (quantity / Math.max(...product.monthly_data)) *
                                  60,
                                8
                              ),
                            },
                          ]}
                        />
                        <Text style={styles.monthLabel}>
                          {
                            [
                              "J",
                              "F",
                              "M",
                              "A",
                              "M",
                              "J",
                              "J",
                              "A",
                              "S",
                              "O",
                              "N",
                              "D",
                            ][monthIndex]
                          }
                        </Text>
                        <Text style={styles.quantityLabel}>{quantity}</Text>
                      </View>
                    ))}
                  </View>
                  <Text style={styles.totalQuantity}>
                    Total: {product.total_quantity} units
                  </Text>
                </View>
              ))}
          </View>
        </ScrollView>
      </View>

      {/* Sales Trend */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sales Trend</Text>
        <View style={styles.salesChart}>
          {analytics?.salesTrendData?.slice(-7).map((day, index) => (
            <View key={day.date} style={styles.salesDay}>
              <View style={styles.salesBarContainer}>
                <View
                  style={[
                    styles.salesBar,
                    {
                      height: Math.max(
                        (day.total_sales /
                          Math.max(
                            ...analytics?.salesTrendData?.map(
                              (d) => d.total_sales || 1
                            )
                          )) *
                          100,
                        20
                      ),
                    },
                  ]}
                />
              </View>
              <Text style={styles.salesDate}>
                {new Date(day.date).getDate()}
              </Text>
              <Text style={styles.salesValue}>
                ₱{(day.total_sales / 1000).toFixed(0)}k
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Recent Sales Orders */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Sales Orders</Text>
        <View style={styles.ordersContainer}>
          {analytics?.historySalesOrders?.slice(0, 5).map((order) => (
            <View key={order.id} style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <Text style={styles.orderNumber}>
                  Order #{order.sales_order_number}
                </Text>
                <Text style={styles.orderDate}>{order.date_sold}</Text>
                <Text style={styles.orderTotal}>
                  ₱{parseFloat(order.total).toLocaleString()}
                </Text>
              </View>
              <View style={styles.orderItems}>
                {order.saleItems.map((item, index) => (
                  <View key={item.id} style={styles.orderItem}>
                    <Text style={styles.itemName}>
                      {item.item.brand_name} ({item.item.generic_name})
                    </Text>
                    <Text style={styles.itemDetails}>
                      {item.quantity} units • ₱{item.total.toLocaleString()}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Current Pending Orders */}
      {analytics?.currentSalesOrders?.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Pending Orders</Text>
          <View style={styles.ordersContainer}>
            {analytics?.currentSalesOrders?.map((order) => (
              <View
                key={order.id}
                style={[styles.orderCard, styles.pendingOrder]}
              >
                <View style={styles.orderHeader}>
                  <Text style={styles.orderNumber}>
                    Order #{order.sales_order_number}
                  </Text>
                  <Text style={[styles.orderStatus, styles.pendingStatus]}>
                    Pending
                  </Text>
                  <Text style={styles.orderTotal}>
                    ₱{parseFloat(order.total).toLocaleString()}
                  </Text>
                </View>
                <View style={styles.orderItems}>
                  {order.saleItems.map((item, index) => (
                    <View key={item.id} style={styles.orderItem}>
                      <Text style={styles.itemName}>
                        {item.item.brand_name} ({item.item.generic_name})
                      </Text>
                      <Text style={styles.itemDetails}>
                        {item.quantity} units • ₱{item.total.toLocaleString()}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  loadingText: {
    marginTop: 12,
    color: "#64748b",
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    padding: 20,
  },
  errorText: {
    color: "#dc2626",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: "#1F7FD8",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 16,
  },
  header: {
    padding: 20,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 16,
    textAlign: "center",
  },
  yearSelector: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  yearButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f1f5f9",
  },
  yearButtonActive: {
    backgroundColor: "#1F7FD8",
  },
  yearButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748b",
  },
  yearButtonTextActive: {
    color: "white",
  },
  statsScroll: {
    paddingLeft: 16,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    paddingRight: 16,
    paddingVertical: 16,
  },
  statsCard: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    width: 250,
  },
  statsValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 4,
  },
  statsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 2,
  },
  statsSubtitle: {
    fontSize: 11,
    color: "#6b7280",
  },
  section: {
    backgroundColor: "white",
    margin: 16,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 16,
  },
  distributionContainer: {
    gap: 12,
  },
  distributionItem: {
    gap: 4,
  },
  distributionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  distributionName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  distributionQuantity: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#3b82f6",
  },
  distributionBar: {
    height: 8,
    backgroundColor: "#f1f5f9",
    borderRadius: 4,
    overflow: "hidden",
  },
  distributionFill: {
    height: "100%",
    borderRadius: 4,
  },
  trendContainer: {
    flexDirection: "row",
    gap: 16,
    paddingVertical: 8,
  },
  productTrend: {
    backgroundColor: "#f8fafc",
    padding: 12,
    borderRadius: 8,
    minWidth: 120,
  },
  productName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 2,
  },
  productGeneric: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 12,
  },
  monthlyBars: {
    flexDirection: "row",
    gap: 4,
    alignItems: "flex-end",
    marginBottom: 8,
  },
  monthBar: {
    alignItems: "center",
    flex: 1,
  },
  quantityBar: {
    width: 6,
    backgroundColor: "#1F7FD8",
    borderRadius: 2,
    marginBottom: 4,
  },
  monthLabel: {
    fontSize: 10,
    color: "#64748b",
  },
  quantityLabel: {
    fontSize: 8,
    color: "#94a3b8",
  },
  totalQuantity: {
    fontSize: 11,
    color: "#374151",
    fontWeight: "600",
    textAlign: "center",
  },
  salesChart: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 120,
    paddingVertical: 16,
  },
  salesDay: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: 4,
  },
  salesBarContainer: {
    height: 80,
    justifyContent: "flex-end",
    marginBottom: 4,
  },
  salesBar: {
    width: 12,
    backgroundColor: "#10b981",
    borderRadius: 4,
  },
  salesDate: {
    fontSize: 10,
    color: "#64748b",
    marginBottom: 2,
  },
  salesValue: {
    fontSize: 10,
    fontWeight: "600",
    color: "#374151",
  },
  ordersContainer: {
    gap: 12,
  },
  orderCard: {
    backgroundColor: "#f8fafc",
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#10b981",
  },
  pendingOrder: {
    borderLeftColor: "#f59e0b",
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  orderNumber: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1e293b",
  },
  orderDate: {
    fontSize: 12,
    color: "#64748b",
  },
  orderTotal: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#059669",
  },
  orderStatus: {
    fontSize: 12,
    fontWeight: "600",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  pendingStatus: {
    backgroundColor: "#fef3c7",
    color: "#d97706",
  },
  orderItems: {
    gap: 6,
  },
  orderItem: {
    paddingLeft: 8,
    borderLeftWidth: 2,
    borderLeftColor: "#e2e8f0",
  },
  itemName: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 2,
  },
  itemDetails: {
    fontSize: 11,
    color: "#64748b",
  },
});
