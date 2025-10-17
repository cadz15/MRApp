import SyncingPage from "@/components/SyncingPage";
import {
  checkMedRep,
  syncCustomers,
  syncItems,
  syncLocalCustomers,
  syncLocalSalesOrders,
  syncSalesOrder,
} from "@/OfflineDB/sync";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface SyncingPageProps {
  percentValue: number;
  currentStep: string;
  isSyncing: boolean;
  isComplete?: boolean;
}

export default function settings() {
  const [syncing, setSyncing] = useState(false);
  const [syncingValue, setSyncingValue] = useState(0);
  const [currentStep, setCurrentStep] = useState("Ready to sync");
  const [syncComplete, setSyncComplete] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      easing: Easing.inOut(Easing.elastic(1)),
      useNativeDriver: true,
    }).start();
  }, []);

  const handleSyncPress = () => {
    // Button press animation
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    startSync();
  };

  const startSync = async () => {
    setSyncing(true);
    setSyncComplete(false);
    setSyncingValue(0);

    try {
      setCurrentStep("Initializing sync...");
      setSyncingValue(10);
      const isApiSecure = await checkMedRep();

      if (isApiSecure !== 200) {
        setCurrentStep("Sync failed - tap to retry");
        setSyncingValue(0);
        setSyncing(false);
        return;
      }

      setCurrentStep("Syncing customers...");
      setSyncingValue(30);
      await syncCustomers();

      setCurrentStep("Syncing items...");
      setSyncingValue(60);
      await syncItems();

      setCurrentStep("Syncing sales orders...");
      setSyncingValue(80);
      await syncSalesOrder();

      setCurrentStep("Syncing local data...");
      setSyncingValue(90);
      await syncLocalCustomers();

      setSyncingValue(98);
      await syncLocalSalesOrders();

      setCurrentStep("Finalizing...");
      setSyncingValue(100);
      await new Promise((resolve) => setTimeout(resolve, 500));

      setSyncComplete(true);

      // Show success for 2 seconds then move to main content
      setTimeout(() => {
        setSyncing(false);
      }, 2000);
    } catch (error) {
      console.error("Sync failed:", error);
      setCurrentStep("Sync failed - tap to retry");
      setSyncingValue(0);
      setSyncing(false);
    }
  };

  const handleRetry = () => {
    if (currentStep === "Sync failed - tap to retry") {
      handleSyncPress();
    }
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {syncing ? (
        <SyncingPage
          currentStep={currentStep}
          percentValue={syncingValue}
          isSyncing={!syncComplete}
          isComplete={syncComplete}
        />
      ) : (
        <View style={styles.homeContainer}>
          {/* Main Content when not syncing */}

          <View style={styles.syncPromptContainer}>
            <LinearGradient
              colors={["#667eea", "#764ba2"]}
              style={styles.gradientBackground}
            >
              {/* Sync Icon */}
              <View style={styles.iconContainer}>
                <View style={styles.syncIcon}>
                  <Text style={styles.syncSymbol}>🔄</Text>
                </View>
              </View>

              {/* Content */}
              <View style={styles.content}>
                <Text style={styles.title}>Data Sync</Text>
                <Text style={styles.subtitle}>
                  Sync your offline data with the latest information from the
                  server
                </Text>

                {/* Last Sync Info */}
                <View style={styles.lastSyncContainer}>
                  <Text style={styles.lastSyncText}>
                    Last sync: {syncingValue === 0 ? "Never" : "Just now"}
                  </Text>
                </View>

                {/* Sync Button */}
                <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                  <TouchableOpacity
                    style={[
                      styles.syncButton,
                      currentStep === "Sync failed - tap to retry" &&
                        styles.retryButton,
                    ]}
                    onPress={handleSyncPress}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={
                        currentStep === "Sync failed - tap to retry"
                          ? ["#ef4444", "#dc2626"]
                          : ["#4ade80", "#22c55e"]
                      }
                      style={styles.buttonGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <Text style={styles.syncButtonText}>
                        {currentStep === "Sync failed - tap to retry"
                          ? "Retry Sync"
                          : "Sync Now"}
                      </Text>
                      <Text style={styles.syncButtonSubtext}>
                        {currentStep === "Sync failed - tap to retry"
                          ? "Tap to try again"
                          : "Download latest data"}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </Animated.View>
              </View>
            </LinearGradient>
          </View>
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  homeContainer: {
    flex: 1,
  },
  syncPromptContainer: {
    flex: 1,
  },
  gradientBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  iconContainer: {
    marginBottom: 40,
  },
  syncIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  syncSymbol: {
    fontSize: 48,
  },
  content: {
    alignItems: "center",
    width: "100%",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "white",
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 40,
    textAlign: "center",
    lineHeight: 22,
  },
  lastSyncContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  lastSyncText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
  },
  syncButton: {
    width: 280,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 40,
  },
  retryButton: {
    shadowColor: "#ef4444",
  },
  buttonGradient: {
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: "center",
  },
  syncButtonText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  syncButtonSubtext: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 14,
  },
  featuresContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: 20,
  },
  featureItem: {
    alignItems: "center",
    flex: 1,
    paddingHorizontal: 8,
  },
  featureIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  featureText: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 12,
    textAlign: "center",
    fontWeight: "500",
  },
});
