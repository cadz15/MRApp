import SyncingPage from "@/components/SyncingPage";
import { getDB } from "@/OfflineDB/db";
import { medrep } from "@/OfflineDB/schema";
import {
  checkMedRep,
  syncCustomers,
  syncDcr,
  syncItems,
  syncLocalCustomers,
  syncLocalDcrs,
  syncLocalSalesOrders,
  syncSalesOrder,
} from "@/OfflineDB/sync";
import { Entypo } from "@expo/vector-icons";
import { eq } from "drizzle-orm";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Easing,
  Modal,
  StyleSheet,
  Text,
  TextInput,
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
  const [showResetKey, setShowResetKey] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [newAppKey, setNewAppKey] = useState("");
  const [isResetting, setIsResetting] = useState(false);
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
    setShowResetKey(false);

    try {
      setCurrentStep("Initializing sync...");
      setSyncingValue(10);
      const isApiSecure = await checkMedRep();

      if (isApiSecure !== 200) {
        setCurrentStep("Sync failed - tap to retry");
        setSyncingValue(0);
        setSyncing(false);
        setShowResetKey(true);
        return;
      }

      setCurrentStep("Syncing customers...");
      console.log("Syncing customers...");

      setSyncingValue(30);
      await syncCustomers();

      setCurrentStep("Syncing items...");
      console.log("Syncing items...");
      setSyncingValue(50);
      await syncItems();

      setCurrentStep("Syncing sales orders...");
      console.log("Syncing sales orders...");
      setSyncingValue(70);
      await syncSalesOrder();

      setCurrentStep("Syncing dcr...");
      console.log("Syncing dcr...");
      setSyncingValue(75);
      await syncDcr();

      setCurrentStep("Syncing local data...");
      console.log("Syncing local customer...");
      setSyncingValue(80);
      await syncLocalCustomers();

      console.log("Syncing local sales order...");
      setSyncingValue(90);
      await syncLocalSalesOrders();

      console.log("Syncing local dcr...");
      setSyncingValue(96);
      await syncLocalDcrs();

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

  const handleResetAppKey = () => {
    setShowModal(true);
    setNewAppKey("");
  };

  const handleConfirmReset = async () => {
    if (!newAppKey.trim()) {
      Alert.alert("Error", "Please enter a valid App Key");
      return;
    }

    setIsResetting(true);

    try {
      const db = await getDB();

      // Update the medical representative's sales_order_app_id
      await db
        .update(medrep)
        .set({
          salesOrderAppId: newAppKey.trim(),
          updatedAt: new Date().toISOString(),
        })
        .where(eq(medrep.id, 1)); // Assuming single medrep record with id 1

      Alert.alert(
        "Success",
        "App Key has been reset successfully. Please sync your data again.",
        [
          {
            text: "OK",
            onPress: () => {
              setShowResetKey(false);
              setShowModal(false);
              setNewAppKey("");
              // Optionally trigger a sync after reset
              setTimeout(() => {
                handleSyncPress();
              }, 1000);
            },
          },
        ]
      );
    } catch (error) {
      console.error("Error resetting app key:", error);
      Alert.alert("Error", "Failed to reset App Key. Please try again.");
    } finally {
      setIsResetting(false);
    }
  };

  const handleCancelReset = () => {
    setShowModal(false);
    setNewAppKey("");
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

                {showResetKey && (
                  <TouchableOpacity
                    style={styles.keyReset}
                    onPress={handleResetAppKey}
                  >
                    <Text style={styles.lastSyncText}>
                      <Entypo name="key" size={18} color="red" /> Reset
                    </Text>
                  </TouchableOpacity>
                )}

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

          {/* Reset App Key Modal */}
          <Modal
            visible={showModal}
            transparent={true}
            animationType="slide"
            onRequestClose={handleCancelReset}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Reset App Key</Text>
                  <Text style={styles.modalSubtitle}>
                    Enter your new App Key to reset the connection
                  </Text>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>New App Key</Text>
                  <TextInput
                    style={styles.textInput}
                    value={newAppKey}
                    onChangeText={setNewAppKey}
                    placeholder="Enter new App Key..."
                    placeholderTextColor="#94a3b8"
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!isResetting}
                  />
                </View>

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={handleCancelReset}
                    disabled={isResetting}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.modalButton,
                      styles.confirmButton,
                      (!newAppKey.trim() || isResetting) &&
                        styles.disabledButton,
                    ]}
                    onPress={handleConfirmReset}
                    disabled={!newAppKey.trim() || isResetting}
                  >
                    {isResetting ? (
                      <Text style={styles.confirmButtonText}>Resetting...</Text>
                    ) : (
                      <Text style={styles.confirmButtonText}>Reset Key</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
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
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    marginBottom: 8,
  },
  keyReset: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    marginBottom: 20,
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
    marginVertical: 40,
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
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 8,
    textAlign: "center",
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 20,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: "#1e293b",
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: "#f1f5f9",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  confirmButton: {
    backgroundColor: "#dc2626",
  },
  disabledButton: {
    backgroundColor: "#9ca3af",
  },
  cancelButtonText: {
    color: "#374151",
    fontSize: 16,
    fontWeight: "600",
  },
  confirmButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
