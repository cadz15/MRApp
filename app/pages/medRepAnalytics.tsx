// app/pages/analytics.tsx
import { getDB } from "@/OfflineDB/db";
import {
  customers,
  dailyCallRecords,
  items,
  salesOrderItems,
  salesOrders,
} from "@/OfflineDB/schema";
import { getMedRepData } from "@/OfflineDB/sync";
import { and, count, desc, eq, like, sql, sum } from "drizzle-orm";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

interface Statistics {
  total_sales: number;
  monthly_sales: number;
  total_customers_sold: number;
  monthly_customers_sold: number;
  top_product_type: string;
  total_orders: number;
  monthly_orders: number;
  average_order_value: number;
  dcr_count: number;
  monthly_dcr_count: number;
}

interface SalesPerYearData {
  month: number;
  month_name: string;
  total_sales: number;
  order_count: number;
}

interface ProductDistributionData {
  product_type: string;
  quantity: number;
  percentage: number;
}

interface TopProductsData {
  brand_name: string;
  generic_name: string;
  total_quantity: number;
  total_sales: number;
}

interface CustomerPerformanceData {
  customer_name: string;
  total_orders: number;
  total_spent: number;
  last_order_date: string;
}

interface DailyPerformanceData {
  date: string;
  sales: number;
  orders: number;
  dcr_count: number;
}

export default function AnalyticsPage() {
  const [statistics, setStatistics] = useState<Statistics>({
    total_sales: 0,
    monthly_sales: 0,
    total_customers_sold: 0,
    monthly_customers_sold: 0,
    top_product_type: "No data",
    total_orders: 0,
    monthly_orders: 0,
    average_order_value: 0,
    dcr_count: 0,
    monthly_dcr_count: 0,
  });
  const [salesPerYearData, setSalesPerYearData] = useState<SalesPerYearData[]>(
    []
  );
  const [productDistributionData, setProductDistributionData] = useState<
    ProductDistributionData[]
  >([]);
  const [topProducts, setTopProducts] = useState<TopProductsData[]>([]);
  const [topCustomers, setTopCustomers] = useState<CustomerPerformanceData[]>(
    []
  );
  const [dailyPerformance, setDailyPerformance] = useState<
    DailyPerformanceData[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year">(
    "month"
  );

  const [availableYears, setAvailableYears] = useState<number[]>([]);

  useEffect(() => {
    setLoading(true);
    loadAvailableYears();
    loadAnalyticsData();
  }, [selectedYear, timeRange, isRefreshing]);

  const loadAvailableYears = async () => {
    try {
      const db = await getDB();
      const medrep = await getMedRepData();

      if (!medrep || medrep.length === 0) return;

      // Get all unique years from sales orders
      const yearsResult = await db
        .select({
          year: sql`CAST(substr(${salesOrders.dateSold}, -4) AS INT)`,
        })
        .from(salesOrders)
        .where(eq(salesOrders.medicalRepresentativeId, medrep[0].onlineId))
        .groupBy(sql`substr(${salesOrders.dateSold}, -4)`)
        .orderBy(sql`substr(${salesOrders.dateSold}, -4)`);

      const years = yearsResult
        .map((item: any) => item.year)
        .filter((year: number) => !isNaN(year));
      const currentYear = new Date().getFullYear();

      if (years.length > 0) {
        const oldestYear = Math.min(...years);
        const yearsList = [];

        // Generate years from oldest year to current year + 1
        for (let year = oldestYear; year <= currentYear + 1; year++) {
          yearsList.push(year);
        }

        setAvailableYears(yearsList);

        // Set default selected year to current year if available
        if (yearsList.includes(currentYear) && selectedYear === currentYear) {
          // Already set to current year
        } else if (yearsList.length > 0 && yearsList.includes(selectedYear)) {
          //   setSelectedYear(yearsList[yearsList.length - 2] || yearsList[0]); // Select second last (usually current year) or first
        }
      } else {
        // If no sales data, show current year -1 to current year + 1
        setAvailableYears([currentYear - 1, currentYear, currentYear + 1]);
      }
    } catch (error) {
      console.error("Error loading available years:", error);
      const currentYear = new Date().getFullYear();
      setAvailableYears([currentYear - 1, currentYear, currentYear + 1]);
    }
  };

  const loadAnalyticsData = async () => {
    try {
      const db = await getDB();
      const medrep = await getMedRepData();

      if (!medrep || medrep.length === 0) {
        console.warn("No medical representative data found");
        return;
      }

      const currentYear = selectedYear;
      const currentMonth = new Date().getMonth() + 1;

      // Get all analytics data
      const stats = await calculateStatistics(
        db,
        medrep[0].onlineId,
        currentYear,
        currentMonth
      );
      setStatistics(stats);

      const salesData = await getSalesPerYearData(
        db,
        medrep[0].onlineId,
        currentYear
      );

      setSalesPerYearData(salesData);

      const productData = await getProductDistributionData(
        db,
        medrep[0].onlineId,
        currentYear
      );
      setProductDistributionData(productData);

      const topProductsData = await getTopProducts(
        db,
        medrep[0].onlineId,
        currentYear
      );
      setTopProducts(topProductsData);

      const topCustomersData = await getTopCustomers(
        db,
        medrep[0].onlineId,
        currentYear
      );
      setTopCustomers(topCustomersData);

      const dailyData = await getDailyPerformanceData(
        db,
        medrep[0].onlineId,
        currentYear
      );
      setDailyPerformance(dailyData);
    } catch (error) {
      console.error("Error loading analytics data:", error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const calculateStatistics = async (
    db: any,
    medrepId: number,
    year: number,
    month: number
  ) => {
    // Total Sales & Orders
    const totalSalesResult = await db
      .select({ total: sum(salesOrders.total), count: count() })
      .from(salesOrders)
      .where(eq(salesOrders.medicalRepresentativeId, medrepId));

    const totalSales = parseFloat(totalSalesResult[0]?.total || "0");
    const totalOrders = totalSalesResult[0]?.count || 0;

    // Monthly Sales & Orders
    const monthlySalesResult = await db
      .select({ total: sum(salesOrders.total), count: count() })
      .from(salesOrders)
      .where(
        and(
          eq(salesOrders.medicalRepresentativeId, medrepId),
          like(salesOrders.dateSold, `%, ${year}`)
        )
      );

    const monthlySales = parseFloat(monthlySalesResult[0]?.total || "0");
    const monthlyOrders = monthlySalesResult[0]?.count || 0;

    // Customer counts
    const totalCustomersResult = await db
      .select({ count: count() })
      .from(
        db
          .select()
          .from(salesOrders)
          .where(eq(salesOrders.medicalRepresentativeId, medrepId))
          .groupBy(salesOrders.customerId)
          .as("distinct_customers")
      );

    const totalCustomersSold = totalCustomersResult[0]?.count || 0;

    const monthlyCustomersResult = await db.select({ count: count() }).from(
      db
        .select()
        .from(salesOrders)
        .where(
          and(
            eq(salesOrders.medicalRepresentativeId, medrepId),
            like(salesOrders.dateSold, `%, ${year}`)
          )
        )
        .groupBy(salesOrders.customerId)
        .as("distinct_customers")
    );

    const monthlyCustomersSold = monthlyCustomersResult[0]?.count || 0;

    // Top Product Type
    const topProductTypeResult = await db
      .select({
        product_type: items.productType,
        total_quantity: sum(salesOrderItems.quantity),
      })
      .from(salesOrderItems)
      .innerJoin(salesOrders, eq(salesOrderItems.salesOrderId, salesOrders.id))
      .innerJoin(items, eq(salesOrderItems.itemId, items.id))
      .where(eq(salesOrders.medicalRepresentativeId, medrepId))
      .groupBy(items.productType)
      .orderBy(desc(sum(salesOrderItems.quantity)))
      .limit(1);

    const topProductType = topProductTypeResult[0]?.product_type || "No data";

    // DCR counts
    const totalDcrResult = await db
      .select({ count: count() })
      .from(dailyCallRecords);

    const monthlyDcrResult = await db
      .select({ count: count() })
      .from(dailyCallRecords)
      .where(like(dailyCallRecords.dcrDate, `%, ${year}`));

    const dcrCount = totalDcrResult[0]?.count || 0;
    const monthlyDcrCount = monthlyDcrResult[0]?.count || 0;

    // Average order value
    const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

    return {
      total_sales: totalSales,
      monthly_sales: monthlySales,
      total_customers_sold: totalCustomersSold,
      monthly_customers_sold: monthlyCustomersSold,
      top_product_type: topProductType,
      total_orders: totalOrders,
      monthly_orders: monthlyOrders,
      average_order_value: averageOrderValue,
      dcr_count: dcrCount,
      monthly_dcr_count: monthlyDcrCount,
    };
  };

  const getSalesPerYearData = async (
    db: any,
    medrepId: number,
    year: number
  ) => {
    const salesData = await db
      .select({
        month: sql`substr(${salesOrders.dateSold}, 1, 3)`,
        total_sales: sum(salesOrders.total),
        order_count: count(),
      })
      .from(salesOrders)
      .where(
        and(
          eq(salesOrders.medicalRepresentativeId, medrepId),
          like(salesOrders.dateSold, `%, ${year}`)
        )
      )
      .groupBy(sql`substr(${salesOrders.dateSold}, 1, 2)`)
      .orderBy(sql`substr(${salesOrders.dateSold}, 1, 2)`);

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

    return salesData.map((item: any) => ({
      month: item.month,
      month_name: monthNames[item.month - 1] || `Month ${item.month}`,
      total_sales: parseFloat(item.total_sales || "0"),
      order_count: item.order_count,
    }));
  };

  const getProductDistributionData = async (
    db: any,
    medrepId: number,
    year: number
  ) => {
    const productData = await db
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
      .where(
        and(
          eq(salesOrders.medicalRepresentativeId, medrepId),
          like(salesOrders.dateSold, `%, ${year}`)
        )
      )
      .groupBy(items.productType)
      .orderBy(desc(sum(salesOrderItems.quantity)));

    const totalQuantity = productData.reduce(
      (sum: number, item: any) => sum + parseInt(item.total_quantity || "0"),
      0
    );

    return productData.map((item: any) => ({
      product_type: item.product_type,
      quantity: parseInt(item.total_quantity || "0"),
      percentage:
        totalQuantity > 0
          ? (parseInt(item.total_quantity || "0") / totalQuantity) * 100
          : 0,
    }));
  };

  const getTopProducts = async (db: any, medrepId: number, year: number) => {
    const productsData = await db
      .select({
        brand_name: items.brandName,
        generic_name: items.genericName,
        total_quantity: sum(salesOrderItems.quantity),
        total_sales: sum(salesOrderItems.total),
      })
      .from(salesOrderItems)
      .innerJoin(
        salesOrders,
        eq(salesOrderItems.salesOrderOfflineId, salesOrders.id)
      )
      .innerJoin(items, eq(salesOrderItems.itemId, items.id))
      .where(
        and(
          eq(salesOrders.medicalRepresentativeId, medrepId),
          like(salesOrders.dateSold, `%, ${year}`)
        )
      )
      .groupBy(items.id, items.brandName, items.genericName)
      .orderBy(desc(sum(salesOrderItems.quantity)))
      .limit(5);

    return productsData.map((item: any) => ({
      brand_name: item.brand_name || "Unknown",
      generic_name: item.generic_name || "Unknown",
      total_quantity: parseInt(item.total_quantity || "0"),
      total_sales: parseFloat(item.total_sales || "0"),
    }));
  };

  const getTopCustomers = async (db: any, medrepId: number, year: number) => {
    const customersData = await db
      .select({
        customer_name: customers.name,
        total_orders: count(),
        total_spent: sum(salesOrders.total),
        last_order_date: sql`MAX(${salesOrders.dateSold})`,
      })
      .from(salesOrders)
      .innerJoin(customers, eq(salesOrders.customerId, customers.id))
      .where(
        and(
          eq(salesOrders.medicalRepresentativeId, medrepId),
          like(salesOrders.dateSold, `%, ${year}`)
        )
      )
      .groupBy(customers.id, customers.name)
      .orderBy(desc(sum(salesOrders.total)))
      .limit(5);

    return customersData.map((item: any) => ({
      customer_name: item.customer_name,
      total_orders: item.total_orders,
      total_spent: parseFloat(item.total_spent || "0"),
      last_order_date: item.last_order_date,
    }));
  };

  const getDailyPerformanceData = async (
    db: any,
    medrepId: number,
    year: number
  ) => {
    const dailyData = await db
      .select({
        date: salesOrders.dateSold,
        sales: sum(salesOrders.total),
        orders: count(),
      })
      .from(salesOrders)
      .where(
        and(
          eq(salesOrders.medicalRepresentativeId, medrepId),
          like(salesOrders.dateSold, `%, ${year}`)
        )
      )
      .groupBy(salesOrders.dateSold)
      .orderBy(desc(salesOrders.dateSold));
    //   .limit(days);

    return dailyData
      .map((item: any) => ({
        date: item.date,
        sales: parseFloat(item.sales || "0"),
        orders: item.orders,
        dcr_count: 0, // This would need additional query for DCR data
      }))
      .reverse(); // Reverse to show chronological order
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

  const TimeRangeSelector = () => (
    <View style={styles.timeRangeSelector}>
      {(["month", "year"] as const).map((range) => (
        <TouchableOpacity
          key={range}
          style={[
            styles.timeRangeButton,
            timeRange === range && styles.timeRangeButtonActive,
          ]}
          onPress={() => setTimeRange(range)}
        >
          <Text
            style={[
              styles.timeRangeButtonText,
              timeRange === range && styles.timeRangeButtonTextActive,
            ]}
          >
            {range.charAt(0).toUpperCase() + range.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const YearSelector = () => {
    // If years haven't loaded yet, show loading state
    if (availableYears.length === 0) {
      return (
        <View style={styles.yearSelector}>
          <View style={[styles.yearButton, styles.yearButtonLoading]}>
            <Text style={styles.yearButtonText}>Loading...</Text>
          </View>
        </View>
      );
    }

    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.yearSelectorScroll}
        contentContainerStyle={styles.yearSelectorContent}
      >
        {availableYears.map((year) => (
          <TouchableOpacity
            key={year}
            style={[
              styles.yearButton,
              selectedYear === year && styles.yearButtonActive,
            ]}
            onPressIn={() => {
              setSelectedYear(year);
            }}
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
      </ScrollView>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading analytics...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          onRefresh={() => setIsRefreshing(true)}
          refreshing={isRefreshing}
        />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Sales Analytics</Text>
        <YearSelector />
      </View>

      {/* Key Statistics Cards */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.horizontalScroll}
      >
        <View style={styles.statsRow}>
          <StatsCard
            title="Total Sales"
            value={`₱${statistics.total_sales.toLocaleString()}`}
            subtitle="All time revenue"
            color="#4ade80"
          />
          <StatsCard
            title="Monthly Sales"
            value={`₱${statistics.monthly_sales.toLocaleString()}`}
            subtitle={`${selectedYear} revenue`}
            color="#3b82f6"
          />
          <StatsCard
            title="Total Orders"
            value={statistics.total_orders.toString()}
            subtitle="All time orders"
            color="#f59e0b"
          />
          <StatsCard
            title="Avg Order Value"
            value={`₱${statistics.average_order_value.toFixed(0)}`}
            subtitle="Average per order"
            color="#ef4444"
          />
          <StatsCard
            title="DCR Visits"
            value={statistics.dcr_count.toString()}
            subtitle="Customer visits"
            color="#8b5cf6"
          />
        </View>
      </ScrollView>

      {/* Monthly Sales Trend */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Monthly Sales Trend - {selectedYear}
        </Text>
        <View style={styles.chartContainer}>
          {salesPerYearData.map((monthData, index) => (
            <View key={monthData.month} style={styles.barChart}>
              <View style={styles.barContainer}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: Math.max(
                        (monthData.total_sales /
                          Math.max(
                            ...salesPerYearData.map((d) => d.total_sales || 1)
                          )) *
                          150,
                        20
                      ),
                    },
                  ]}
                />
                <Text style={styles.barValue}>
                  ₱{(monthData.total_sales / 1000).toFixed(0)}k
                </Text>
              </View>
              <Text style={styles.barLabel}>{monthData.month_name}</Text>
              <Text style={styles.barSubLabel}>
                {monthData.order_count} orders
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Product Performance */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Product Performance</Text>

        {/* Product Distribution */}
        <Text style={styles.subSectionTitle}>Distribution by Type</Text>
        <View style={styles.distributionContainer}>
          {productDistributionData.map((product, index) => (
            <View key={product.product_type} style={styles.distributionItem}>
              <View style={styles.distributionHeader}>
                <Text style={styles.distributionName}>
                  {product.product_type}
                </Text>
                <Text style={styles.distributionPercentage}>
                  {product.percentage.toFixed(1)}%
                </Text>
              </View>
              <View style={styles.distributionBar}>
                <View
                  style={[
                    styles.distributionFill,
                    { width: `${product.percentage}%` },
                    {
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
              <Text style={styles.distributionQuantity}>
                {product.quantity} units
              </Text>
            </View>
          ))}
        </View>

        {/* Top Products */}
        <Text style={styles.subSectionTitle}>Top Selling Products</Text>
        <View style={styles.topProductsContainer}>
          {topProducts.map((product, index) => (
            <View key={index} style={styles.productItem}>
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{product.brand_name}</Text>
                <Text style={styles.productGeneric}>
                  {product.generic_name}
                </Text>
              </View>
              <View style={styles.productStats}>
                <Text style={styles.productQuantity}>
                  {product.total_quantity} units
                </Text>
                <Text style={styles.productSales}>
                  ₱{product.total_sales.toLocaleString()}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Customer Performance */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Top Customers - {selectedYear}</Text>
        <View style={styles.customersContainer}>
          {topCustomers.map((customer, index) => (
            <View key={index} style={styles.customerItem}>
              <View style={styles.customerRank}>
                <Text style={styles.rankNumber}>{index + 1}</Text>
              </View>
              <View style={styles.customerInfo}>
                <Text style={styles.customerName}>
                  {customer.customer_name}
                </Text>
                <Text style={styles.customerDetails}>
                  {customer.total_orders} orders • ₱
                  {customer.total_spent.toLocaleString()}
                </Text>
                <Text style={styles.customerLastOrder}>
                  Last order: {customer.last_order_date}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Daily Performance */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Sales Performance</Text>
          {/* <TimeRangeSelector /> */}
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.dailyPerformanceContainer}>
            {dailyPerformance.map((day, index) => (
              <View key={index} style={styles.dayItem}>
                <Text style={styles.dayDate}>
                  {day.date.split("/")[0]}/{day.date.split("/")[1]}
                </Text>
                <View style={styles.dayBar}>
                  <View
                    style={[
                      styles.daySalesBar,
                      {
                        height: Math.max(
                          (day.sales /
                            Math.max(
                              ...dailyPerformance.map((d) => d.sales || 1)
                            )) *
                            80,
                          10
                        ),
                      },
                    ]}
                  />
                </View>
                <Text style={styles.daySales}>
                  ₱{(day.sales / 1000).toFixed(0)}k
                </Text>
                <Text style={styles.dayOrders}>{day.orders} orders</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Performance Summary */}
      <View style={styles.summarySection}>
        <Text style={styles.summaryTitle}>
          Performance Summary - {selectedYear}
        </Text>
        <View style={styles.summaryGrid}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Revenue</Text>
            <Text style={styles.summaryValue}>
              ₱{statistics.monthly_sales.toLocaleString()}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Orders</Text>
            <Text style={styles.summaryValue}>{statistics.monthly_orders}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Active Customers</Text>
            <Text style={styles.summaryValue}>
              {statistics.monthly_customers_sold}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Customer Visits</Text>
            <Text style={styles.summaryValue}>
              {statistics.monthly_dcr_count}
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
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
  },
  horizontalScroll: {
    paddingLeft: 16,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    paddingRight: 16,
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
    minWidth: 200,
    marginVertical: 10,
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
  yearSelectorScroll: {
    maxHeight: 40,
  },
  yearSelectorContent: {
    flexDirection: "row",
    gap: 8,
    paddingRight: 16,
  },
  yearSelector: {
    flexDirection: "row",
    gap: 8,
  },
  yearButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f1f5f9",
    minWidth: 70,
    alignItems: "center",
  },
  yearButtonActive: {
    backgroundColor: "#3b82f6",
  },
  yearButtonLoading: {
    opacity: 0.7,
  },
  yearButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748b",
  },
  yearButtonTextActive: {
    color: "white",
  },
  timeRangeSelector: {
    flexDirection: "row",
    backgroundColor: "#f1f5f9",
    borderRadius: 8,
    padding: 4,
  },
  timeRangeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  timeRangeButtonActive: {
    backgroundColor: "#3b82f6",
  },
  timeRangeButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748b",
  },
  timeRangeButtonTextActive: {
    color: "white",
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
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 16,
  },
  subSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
    marginTop: 16,
  },
  chartContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 200,
    paddingVertical: 16,
  },
  barChart: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: 4,
  },
  barContainer: {
    alignItems: "center",
    height: 150,
    justifyContent: "flex-end",
  },
  bar: {
    width: 20,
    backgroundColor: "#3b82f6",
    borderRadius: 4,
    marginBottom: 4,
  },
  barValue: {
    fontSize: 10,
    color: "#64748b",
    fontWeight: "600",
  },
  barLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
    marginTop: 4,
  },
  barSubLabel: {
    fontSize: 10,
    color: "#9ca3af",
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
  distributionPercentage: {
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
  distributionQuantity: {
    fontSize: 12,
    color: "#6b7280",
  },
  topProductsContainer: {
    gap: 12,
  },
  productItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#f8fafc",
    borderRadius: 8,
  },
  productInfo: {
    flex: 1,
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
  },
  productStats: {
    alignItems: "flex-end",
  },
  productQuantity: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 2,
  },
  productSales: {
    fontSize: 12,
    color: "#059669",
    fontWeight: "600",
  },
  customersContainer: {
    gap: 12,
  },
  customerItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#f8fafc",
    borderRadius: 8,
  },
  customerRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#3b82f6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  rankNumber: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 2,
  },
  customerDetails: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 2,
  },
  customerLastOrder: {
    fontSize: 11,
    color: "#9ca3af",
  },
  dailyPerformanceContainer: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 8,
  },
  dayItem: {
    alignItems: "center",
    padding: 8,
    minWidth: 60,
  },
  dayDate: {
    fontSize: 10,
    color: "#64748b",
    marginBottom: 8,
  },
  dayBar: {
    height: 80,
    justifyContent: "flex-end",
    marginBottom: 4,
  },
  daySalesBar: {
    width: 20,
    backgroundColor: "#10b981",
    borderRadius: 4,
  },
  daySales: {
    fontSize: 10,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 2,
  },
  dayOrders: {
    fontSize: 9,
    color: "#9ca3af",
  },
  summarySection: {
    backgroundColor: "white",
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 16,
  },
  summaryGrid: {
    gap: 12,
  },
  summaryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  summaryLabel: {
    fontSize: 14,
    color: "#64748b",
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1e293b",
  },
});
