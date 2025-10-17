import { getAnalytics } from "@/OfflineDB/sync";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

// Sample data
const SAMPLE_DATA = {
  monthlySales: 124580,
  totalCustomersSold: 342,
  popularProductType: "Exclusive",
  productTypeSales: {
    exclusive: [
      45000, 52000, 48000, 61000, 58000, 72000, 68000, 75000, 82000, 78000,
      85000, 92000,
    ],
    generic: [
      38000, 42000, 45000, 39000, 51000, 48000, 55000, 52000, 58000, 61000,
      59000, 65000,
    ],
    regulated: [
      28000, 32000, 35000, 31000, 38000, 42000, 39000, 45000, 48000, 52000,
      55000, 58000,
    ],
  },
  monthlyRevenue: [
    45000, 52000, 48000, 61000, 58000, 72000, 68000, 75000, 82000, 78000, 85000,
    92000,
  ],
  productDistribution: [
    { name: "Exclusive", population: 45, color: "#4ade80" },
    { name: "Generic", population: 35, color: "#3b82f6" },
    { name: "Regulated", population: 20, color: "#f59e0b" },
  ],
  notifications: [
    {
      id: 1,
      title: "New Order Received",
      message: "Order #ORD-0012 has been placed by Customer A",
      time: "2 mins ago",
      type: "order",
      read: false,
    },
    {
      id: 2,
      title: "Low Stock Alert",
      message: 'Product "MediCare Plus" is running low on stock',
      time: "1 hour ago",
      type: "alert",
      read: false,
    },
    {
      id: 3,
      title: "Sync Completed",
      message: "Data synchronization completed successfully",
      time: "2 hours ago",
      type: "success",
      read: true,
    },
    {
      id: 4,
      title: "New Customer Registered",
      message: "Pharmacy Plus has joined the platform",
      time: "5 hours ago",
      type: "info",
      read: true,
    },
  ],
  schedules: {
    "2025-12-15": [
      {
        id: 1,
        title: "Meeting with Pharma Corp",
        time: "10:00 AM",
        type: "meeting",
      },
      {
        id: 2,
        title: "Product Training Session",
        time: "2:00 PM",
        type: "training",
      },
    ],
    "2025-12-18": [
      { id: 3, title: "Sales Review", time: "11:00 AM", type: "review" },
    ],
    "2025-12-20": [
      {
        id: 4,
        title: "Client Visit - MedExpress",
        time: "9:30 AM",
        type: "visit",
      },
      { id: 5, title: "Team Building", time: "4:00 PM", type: "event" },
    ],
    "2025-12-22": [
      {
        id: 6,
        title: "Quarterly Planning",
        time: "10:00 AM",
        type: "planning",
      },
    ],
  },
};

// Try importing react-native-chart-kit with error handling
let LineChart, BarChart, PieChart;
let ChartKitAvailable = false;

try {
  const chartKit = require("react-native-chart-kit");
  LineChart = chartKit.LineChart;
  BarChart = chartKit.BarChart;
  PieChart = chartKit.PieChart;
  ChartKitAvailable = true;
} catch (error) {
  console.warn("react-native-chart-kit not available, using fallback charts");
  ChartKitAvailable = false;
}

// Fallback chart components
const FallbackLineChart = ({ data, width, height }) => (
  <View style={[styles.fallbackChart, { width, height }]}>
    <Text style={styles.fallbackText}>Line Chart Preview</Text>
    <Text style={styles.fallbackSubtext}>
      Chart data: {data.datasets[0].data.join(", ")}
    </Text>
  </View>
);

const FallbackBarChart = ({ data, width, height }) => (
  <View style={[styles.fallbackChart, { width, height }]}>
    <Text style={styles.fallbackText}>Bar Chart Preview</Text>
    <Text style={styles.fallbackSubtext}>
      Chart data: {data.datasets[0].data.join(", ")}
    </Text>
  </View>
);

const FallbackPieChart = ({ data, width, height }) => (
  <View style={[styles.fallbackChart, { width, height }]}>
    <Text style={styles.fallbackText}>Pie Chart Preview</Text>
    <Text style={styles.fallbackSubtext}>
      Distribution:{" "}
      {data.map((item) => `${item.name}: ${item.population}%`).join(", ")}
    </Text>
  </View>
);

export default function DashboardScreen() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [activeChart, setActiveChart] = useState("line");
  const [isLoading, setIsLoading] = useState(true);
  const [analytics, setAnalytics] = useState(SAMPLE_DATA);

  const scrollY = useRef(new Animated.Value(0)).current;

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.9],
    extrapolate: "clamp",
  });

  // Add these skeleton components after your other component declarations
  const SkeletonStatsCard = () => (
    <View style={[styles.statsCard, styles.skeletonCard]}>
      <View style={styles.statsContent}>
        <View>
          <View style={[styles.skeletonText, styles.skeletonTitle]} />
          <View style={[styles.skeletonText, styles.skeletonSubtitle]} />
        </View>
        <View style={[styles.skeletonIcon, styles.statsIcon]} />
      </View>
    </View>
  );

  const SkeletonChart = () => (
    <View style={[styles.section, styles.skeletonSection]}>
      <View style={styles.sectionHeader}>
        <View style={[styles.skeletonText, styles.skeletonSectionTitle]} />
        <View style={styles.chartSwitcher}>
          {[1, 2, 3].map((item) => (
            <View
              key={item}
              style={[styles.chartButton, styles.skeletonChartButton]}
            />
          ))}
        </View>
      </View>
      <View style={[styles.skeletonChart, styles.skeletonElement]} />
    </View>
  );

  const SkeletonCalendar = () => (
    <View style={[styles.section, styles.skeletonSection]}>
      <View style={styles.sectionHeader}>
        <View style={[styles.skeletonText, styles.skeletonSectionTitle]} />
        <View style={[styles.skeletonText, styles.skeletonSeeAll]} />
      </View>
      <View style={styles.calendar}>
        <View style={styles.calendarHeader}>
          <View style={[styles.skeletonText, styles.skeletonMonth]} />
          <View style={styles.calendarControls}>
            <View style={[styles.skeletonControl, styles.skeletonElement]} />
            <View style={[styles.skeletonText, styles.skeletonToday]} />
            <View style={[styles.skeletonControl, styles.skeletonElement]} />
          </View>
        </View>
        <View style={styles.calendarGrid}>
          {[...Array(42)].map((_, index) => (
            <View
              key={index}
              style={[styles.calendarDay, styles.skeletonCalendarDay]}
            />
          ))}
        </View>
      </View>
    </View>
  );

  const SkeletonNotification = () => (
    <View style={[styles.notificationCard, styles.skeletonNotification]}>
      <View style={[styles.skeletonIcon, styles.notificationIcon]} />
      <View style={styles.notificationContent}>
        <View style={[styles.skeletonText, styles.skeletonNotificationTitle]} />
        <View
          style={[styles.skeletonText, styles.skeletonNotificationMessage]}
        />
        <View style={[styles.skeletonText, styles.skeletonNotificationTime]} />
      </View>
    </View>
  );

  const StatsCard = ({ title, value, subtitle, icon, gradient }) => (
    <LinearGradient colors={gradient} style={styles.statsCard}>
      <View style={styles.statsContent}>
        <View>
          <Text style={styles.statsValue}>{value}</Text>
          <Text style={styles.statsTitle}>{title}</Text>
          <Text style={styles.statsSubtitle}>{subtitle}</Text>
        </View>
        <View style={styles.statsIcon}>
          <Ionicons name={icon} size={32} color="white" />
        </View>
      </View>
    </LinearGradient>
  );

  const NotificationCard = ({ notification }) => (
    <TouchableOpacity
      style={[
        styles.notificationCard,
        !notification.read && styles.unreadNotification,
      ]}
      activeOpacity={0.7}
    >
      <View style={styles.notificationIcon}>
        <Ionicons
          name={
            notification.type === "order"
              ? "cart"
              : notification.type === "alert"
              ? "warning"
              : notification.type === "success"
              ? "checkmark-circle"
              : "information-circle"
          }
          size={20}
          color={
            notification.type === "order"
              ? "#4ade80"
              : notification.type === "alert"
              ? "#f59e0b"
              : notification.type === "success"
              ? "#10b981"
              : "#3b82f6"
          }
        />
      </View>
      <View style={styles.notificationContent}>
        <Text style={styles.notificationTitle}>{notification.title}</Text>
        <Text style={styles.notificationMessage}>{notification.message}</Text>
        <Text style={styles.notificationTime}>{notification.time}</Text>
      </View>
      {!notification.read && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );

  const CalendarDay = ({ date, hasSchedule }) => {
    const isToday = date.toDateString() === new Date().toDateString();

    return (
      <TouchableOpacity
        style={[
          styles.calendarDay,
          isToday && styles.today,
          hasSchedule && styles.hasSchedule,
        ]}
        onPress={() => {
          if (hasSchedule) {
            setSelectedDate(date);
            setShowScheduleModal(true);
          }
        }}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.calendarDayText,
            isToday && styles.todayText,
            hasSchedule && styles.scheduleText,
          ]}
        >
          {date.getDate()}
        </Text>
        {hasSchedule && <View style={styles.scheduleDot} />}
      </TouchableOpacity>
    );
  };

  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(year, month, i);
      const dateString = date.toISOString().split("T")[0];
      const hasSchedule = analytics.schedules[dateString];
      days.push({ date, hasSchedule: !!hasSchedule });
    }

    return days;
  };

  const ScheduleModal = () => {
    if (!selectedDate || !showScheduleModal) return null;

    const dateString = selectedDate.toISOString().split("T")[0];
    const schedules = analytics.schedules[dateString] || [];

    return (
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <LinearGradient
            colors={["#667eea", "#764ba2"]}
            style={styles.modalHeader}
          >
            <Text style={styles.modalTitle}>
              Schedules for{" "}
              {selectedDate.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Text>
            <TouchableOpacity
              onPress={() => setShowScheduleModal(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
          </LinearGradient>

          <ScrollView style={styles.scheduleList}>
            {schedules.map((schedule) => (
              <View key={schedule.id} style={styles.scheduleItem}>
                <View
                  style={[
                    styles.scheduleIcon,
                    {
                      backgroundColor:
                        schedule.type === "meeting"
                          ? "#3b82f6"
                          : schedule.type === "training"
                          ? "#8b5cf6"
                          : schedule.type === "review"
                          ? "#f59e0b"
                          : schedule.type === "visit"
                          ? "#10b981"
                          : "#ef4444",
                    },
                  ]}
                >
                  <Ionicons
                    name={
                      schedule.type === "meeting"
                        ? "people"
                        : schedule.type === "training"
                        ? "school"
                        : schedule.type === "review"
                        ? "stats-chart"
                        : schedule.type === "visit"
                        ? "business"
                        : "calendar"
                    }
                    size={16}
                    color="white"
                  />
                </View>
                <View style={styles.scheduleDetails}>
                  <Text style={styles.scheduleTitle}>{schedule.title}</Text>
                  <Text style={styles.scheduleTime}>{schedule.time}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    );
  };

  const ChartSwitcher = () => (
    <View style={styles.chartSwitcher}>
      <TouchableOpacity
        style={[
          styles.chartButton,
          activeChart === "line" && styles.activeChartButton,
        ]}
        onPress={() => setActiveChart("line")}
      >
        <Ionicons
          name="trending-up"
          size={16}
          color={activeChart === "line" ? "white" : "#64748b"}
        />
        <Text
          style={[
            styles.chartButtonText,
            activeChart === "line" && styles.activeChartButtonText,
          ]}
        >
          Line
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.chartButton,
          activeChart === "bar" && styles.activeChartButton,
        ]}
        onPress={() => setActiveChart("bar")}
      >
        <Ionicons
          name="bar-chart"
          size={16}
          color={activeChart === "bar" ? "white" : "#64748b"}
        />
        <Text
          style={[
            styles.chartButtonText,
            activeChart === "bar" && styles.activeChartButtonText,
          ]}
        >
          Bar
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.chartButton,
          activeChart === "pie" && styles.activeChartButton,
        ]}
        onPress={() => setActiveChart("pie")}
      >
        <Ionicons
          name="pie-chart"
          size={16}
          color={activeChart === "pie" ? "white" : "#64748b"}
        />
        <Text
          style={[
            styles.chartButtonText,
            activeChart === "pie" && styles.activeChartButtonText,
          ]}
        >
          Pie
        </Text>
      </TouchableOpacity>
    </View>
  );

  const chartConfig = {
    backgroundColor: "#ffffff",
    backgroundGradientFrom: "#ffffff",
    backgroundGradientTo: "#ffffff",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(100, 116, 139, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: "4",
      strokeWidth: "2",
      stroke: "#3b82f6",
    },
  };

  const renderChart = () => {
    const chartWidth = width - 72;
    const chartHeight = 220;

    const lineChartData = {
      labels: [
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
      ],
      datasets: [
        {
          data: analytics.monthlyRevenue,
        },
      ],
    };

    const barChartData = {
      labels: [
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
      ],
      datasets: [
        {
          data: analytics.monthlyRevenue,
        },
      ],
    };

    if (!ChartKitAvailable) {
      // Use fallback charts
      switch (activeChart) {
        case "line":
          return (
            <FallbackLineChart
              data={lineChartData}
              width={chartWidth}
              height={chartHeight}
            />
          );
        case "bar":
          return (
            <FallbackBarChart
              data={barChartData}
              width={chartWidth}
              height={chartHeight}
            />
          );
        case "pie":
          return (
            <FallbackPieChart
              data={analytics.productDistribution}
              width={chartWidth}
              height={chartHeight}
            />
          );
        default:
          return null;
      }
    }

    // Use react-native-chart-kit if available
    switch (activeChart) {
      case "line":
        return (
          <LineChart
            data={lineChartData}
            width={chartWidth}
            height={chartHeight}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
        );

      case "bar":
        return (
          <BarChart
            data={barChartData}
            width={chartWidth}
            height={chartHeight}
            chartConfig={chartConfig}
            style={styles.chart}
          />
        );

      case "pie":
        return (
          <PieChart
            data={analytics.productDistribution}
            width={chartWidth}
            height={chartHeight}
            chartConfig={chartConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
          />
        );

      default:
        return null;
    }
  };

  // Add this useEffect near your other useEffect hooks
  useEffect(() => {
    // Simulate API fetch
    const simulateAPIFetch = async () => {
      // Simulate network delay
      // await new Promise((resolve) => setTimeout(resolve, 2000));
      const res = await getAnalytics();

      console.log(res, "analytics data");

      if (res !== 401 || res !== 500) {
        setAnalytics(res.analytics);
        setIsLoading(false);
      }
    };

    console.log(analytics);

    simulateAPIFetch();
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
      >
        <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
          <LinearGradient
            colors={["#f1f1f1ff", "#f1f1f1ff"]}
            style={styles.headerGradient}
          >
            <View style={styles.headerContent}>
              <View>
                <Text style={styles.greeting}>
                  Welcome to{" "}
                  <Text style={styles.appName}>
                    iConTrade Pharmaceutical - MR App
                  </Text>
                </Text>
                <Text style={styles.subGreeting}>
                  Here's your dashboard overview
                </Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {isLoading || !analytics ? (
          // Skeleton Loading State
          <>
            {/* Stats Cards Skeleton */}
            <View style={styles.statsRow}>
              <SkeletonStatsCard />
              <SkeletonStatsCard />
            </View>
            <View style={styles.statsRow}>
              <SkeletonStatsCard />
              <SkeletonStatsCard />
            </View>

            {/* Chart Skeleton */}
            <SkeletonChart />

            {/* Calendar Skeleton */}
            <SkeletonCalendar />

            {/* Notifications Skeleton */}
            <View style={[styles.section, styles.skeletonSection]}>
              <View style={styles.sectionHeader}>
                <View
                  style={[styles.skeletonText, styles.skeletonSectionTitle]}
                />
                <View style={[styles.skeletonText, styles.skeletonSeeAll]} />
              </View>
              <View style={styles.notificationsList}>
                {[...Array(3)].map((_, index) => (
                  <SkeletonNotification key={index} />
                ))}
              </View>
            </View>
          </>
        ) : (
          <>
            {/* Stats Cards */}
            <View style={styles.statsRow}>
              <StatsCard
                title="Monthly Sales"
                value={`$${(analytics.monthlySales / 1000).toFixed(0)}k`}
                subtitle="+12% from last month"
                icon="trending-up"
                gradient={["#4ade80", "#22c55e"]}
              />
              <StatsCard
                title="Customers Sold"
                value={analytics.totalCustomersSold.toString()}
                subtitle="Active this month"
                icon="people"
                gradient={["#3b82f6", "#2563eb"]}
              />
              <StatsCard
                title="Popular Product"
                value={analytics.popularProductType}
                subtitle="Top performing category"
                icon="star"
                gradient={["#f59e0b", "#d97706"]}
              />
            </View>

            {/* Sales Chart Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Sales Analytics</Text>
                <ChartSwitcher />
              </View>
              {renderChart()}
              {!ChartKitAvailable && (
                <Text style={styles.fallbackWarning}>
                  Install react-native-chart-kit for interactive charts
                </Text>
              )}
            </View>

            {/* Calendar Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Schedule Calendar</Text>
                <TouchableOpacity>
                  {/* <Text style={styles.seeAllText}>View All</Text> */}
                </TouchableOpacity>
              </View>
              <View style={styles.calendar}>
                <View style={styles.calendarHeader}>
                  <Text style={styles.calendarMonth}>
                    {currentMonth.toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })}
                  </Text>
                  <View style={styles.calendarControls}>
                    <TouchableOpacity
                      onPress={() =>
                        setCurrentMonth(
                          new Date(
                            currentMonth.getFullYear(),
                            currentMonth.getMonth() - 1
                          )
                        )
                      }
                    >
                      <Ionicons name="chevron-back" size={20} color="#64748b" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setCurrentMonth(new Date())}
                    >
                      <Text style={styles.todayButton}>Today</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() =>
                        setCurrentMonth(
                          new Date(
                            currentMonth.getFullYear(),
                            currentMonth.getMonth() + 1
                          )
                        )
                      }
                    >
                      <Ionicons
                        name="chevron-forward"
                        size={20}
                        color="#64748b"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={styles.calendarGrid}>
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                    (day) => (
                      <Text key={day} style={styles.calendarWeekday}>
                        {day}
                      </Text>
                    )
                  )}
                  {generateCalendarDays().map((day, index) =>
                    day ? (
                      <CalendarDay
                        key={index}
                        date={day.date}
                        hasSchedule={day.hasSchedule}
                      />
                    ) : (
                      <View key={index} style={styles.calendarDayEmpty} />
                    )
                  )}
                </View>
              </View>
            </View>

            {/* Notifications Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Notifications</Text>
                <TouchableOpacity>
                  {/* <Text style={styles.seeAllText}>See All</Text> */}
                </TouchableOpacity>
              </View>
              <View style={styles.notificationsList}>
                {analytics.notifications.map((notification) => (
                  <NotificationCard
                    key={notification.id}
                    notification={notification}
                  />
                ))}
              </View>
            </View>
          </>
        )}
      </ScrollView>

      <ScheduleModal />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    margin: 20,
    borderRadius: 20,
    elevation: 2,
  },
  headerGradient: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderRadius: 20,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  greeting: {
    fontSize: 20,
    fontWeight: "bold",
    color: "black",
  },
  appName: {
    color: "#3b82f6",
  },
  subGreeting: {
    fontSize: 14,
    color: "rgba(82, 80, 80, 0.8)",
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  statsRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 16,
  },
  statsCard: {
    flex: 1,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  statsContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statsValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 4,
  },
  statsTitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "600",
  },
  statsSubtitle: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.7)",
    marginTop: 2,
  },
  statsIcon: {
    opacity: 0.8,
  },
  section: {
    backgroundColor: "white",
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
  },
  seeAllText: {
    fontSize: 14,
    color: "#3b82f6",
    fontWeight: "600",
  },
  chartSwitcher: {
    flexDirection: "row",
    backgroundColor: "#f1f5f9",
    borderRadius: 12,
    padding: 4,
  },
  chartButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  activeChartButton: {
    backgroundColor: "#3b82f6",
  },
  chartButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748b",
  },
  activeChartButtonText: {
    color: "white",
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  fallbackChart: {
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#e2e8f0",
    borderStyle: "dashed",
  },
  fallbackText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#64748b",
    marginBottom: 8,
  },
  fallbackSubtext: {
    fontSize: 12,
    color: "#94a3b8",
    textAlign: "center",
  },
  fallbackWarning: {
    fontSize: 12,
    color: "#f59e0b",
    textAlign: "center",
    marginTop: 8,
    fontStyle: "italic",
  },
  // ... (keep all other existing styles)
  calendar: {
    backgroundColor: "white",
  },
  calendarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  calendarMonth: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1e293b",
  },
  calendarControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  todayButton: {
    color: "#3b82f6",
    fontWeight: "600",
    fontSize: 14,
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    height: 450,
  },
  calendarWeekday: {
    width: "14.28%",
    textAlign: "center",
    fontSize: 12,
    fontWeight: "600",
    color: "#64748b",
    paddingVertical: 8,
  },
  calendarDay: {
    width: "14.28%",
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    marginVertical: 2,
  },
  calendarDayEmpty: {
    width: "14.28%",
    aspectRatio: 1,
    marginVertical: 2,
  },
  calendarDayText: {
    fontSize: 14,
    color: "#1e293b",
    fontWeight: "500",
  },
  today: {
    backgroundColor: "#3b82f6",
  },
  todayText: {
    color: "white",
    fontWeight: "bold",
  },
  hasSchedule: {
    backgroundColor: "rgba(59, 130, 246, 0.1)",
  },
  scheduleText: {
    color: "#3b82f6",
    fontWeight: "bold",
  },
  scheduleDot: {
    position: "absolute",
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#3b82f6",
  },
  notificationsList: {
    gap: 12,
  },
  notificationCard: {
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    borderLeftWidth: 4,
    borderLeftColor: "#e2e8f0",
  },
  unreadNotification: {
    backgroundColor: "white",
    borderLeftColor: "#3b82f6",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  notificationIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 4,
    lineHeight: 16,
  },
  notificationTime: {
    fontSize: 11,
    color: "#94a3b8",
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#3b82f6",
    marginLeft: 8,
    marginTop: 4,
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 16,
    width: "100%",
    maxHeight: "80%",
    overflow: "hidden",
  },
  modalHeader: {
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  scheduleList: {
    maxHeight: 400,
  },
  scheduleItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  scheduleIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  scheduleDetails: {
    flex: 1,
  },
  scheduleTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 2,
  },
  scheduleTime: {
    fontSize: 12,
    color: "#64748b",
  },
  // Add to your existing StyleSheet
  skeletonCard: {
    backgroundColor: "#e2e8f0",
  },
  skeletonSection: {
    backgroundColor: "#f8fafc",
  },
  skeletonElement: {
    backgroundColor: "#e2e8f0",
  },
  skeletonText: {
    backgroundColor: "#e2e8f0",
    borderRadius: 4,
  },
  skeletonTitle: {
    height: 24,
    width: "60%",
    marginBottom: 8,
  },
  skeletonSubtitle: {
    height: 14,
    width: "80%",
  },
  skeletonSectionTitle: {
    height: 20,
    width: 120,
  },
  skeletonSeeAll: {
    height: 16,
    width: 60,
  },
  skeletonMonth: {
    height: 18,
    width: 140,
  },
  skeletonToday: {
    height: 16,
    width: 40,
  },
  skeletonNotificationTitle: {
    height: 16,
    width: "70%",
    marginBottom: 8,
  },
  skeletonNotificationMessage: {
    height: 12,
    width: "90%",
    marginBottom: 6,
  },
  skeletonNotificationTime: {
    height: 10,
    width: "40%",
  },
  skeletonIcon: {
    backgroundColor: "#e2e8f0",
    borderRadius: 8,
  },
  skeletonChart: {
    height: 220,
    borderRadius: 16,
  },
  skeletonChartButton: {
    backgroundColor: "#e2e8f0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  skeletonControl: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  skeletonCalendarDay: {
    backgroundColor: "#e2e8f0",
  },
  skeletonNotification: {
    backgroundColor: "#f1f5f9",
    borderLeftColor: "#e2e8f0",
  },
});
