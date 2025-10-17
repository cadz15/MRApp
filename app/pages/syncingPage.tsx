import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  StyleSheet,
  Text,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

interface SyncingPageProps {
  percentValue: number;
  currentStep: string;
  isSyncing: boolean;
  isComplete?: boolean;
}

export default function SyncingPage({
  percentValue,
  currentStep,
  isSyncing,
  isComplete = false,
}: SyncingPageProps) {
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const checkmarkAnim = useRef(new Animated.Value(0)).current;

  // Progress animation
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: percentValue,
      duration: 800,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [percentValue]);

  // Animations based on state
  useEffect(() => {
    if (isSyncing && !isComplete) {
      // Pulsing animation for sync icon
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Rotation animation
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    } else if (isComplete) {
      // Success animation
      Animated.timing(checkmarkAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }
  }, [isSyncing, isComplete]);

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const checkmarkScale = checkmarkAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={isComplete ? ["#10b981", "#059669"] : ["#667eea", "#764ba2"]}
        style={styles.gradientBackground}
      >
        {/* Animated Icon */}
        <View style={styles.iconContainer}>
          {isComplete ? (
            <Animated.View
              style={[
                styles.successIcon,
                {
                  transform: [{ scale: checkmarkScale }],
                },
              ]}
            >
              <LinearGradient
                colors={["#ffffff", "#f0f4ff"]}
                style={styles.iconGradient}
              >
                <Text style={styles.successSymbol}>✅</Text>
              </LinearGradient>
            </Animated.View>
          ) : (
            <Animated.View
              style={[
                styles.syncIcon,
                {
                  transform: [
                    { scale: pulseAnim },
                    { rotate: rotateInterpolate },
                  ],
                },
              ]}
            >
              <LinearGradient
                colors={["#ffffff", "#f0f4ff"]}
                style={styles.iconGradient}
              >
                <Text style={styles.syncSymbol}>🔄</Text>
              </LinearGradient>
            </Animated.View>
          )}
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.title}>
            {isComplete ? "Sync Complete!" : "Syncing Data"}
          </Text>
          <Text style={styles.subtitle}>
            {isComplete
              ? "Your data is now up to date"
              : "Updating your local database"}
          </Text>

          {/* Current Step */}
          <View style={styles.stepContainer}>
            <Text style={styles.stepText}>
              {isComplete ? "All data synchronized successfully" : currentStep}
            </Text>
          </View>

          {/* Progress Bar - Only show when not complete */}
          {!isComplete && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBackground}>
                <Animated.View
                  style={[styles.progressFill, { width: progressWidth }]}
                >
                  <LinearGradient
                    colors={["#4ade80", "#22c55e"]}
                    style={StyleSheet.absoluteFill}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  />
                </Animated.View>
              </View>

              {/* Progress Percentage */}
              <View style={styles.percentageContainer}>
                <Text style={styles.percentageText}>
                  {Math.round(percentValue)}%
                </Text>
              </View>
            </View>
          )}

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>📊</Text>
              <Text style={styles.statLabel}>Database</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>🔄</Text>
              <Text style={styles.statLabel}>Real-time</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>⚡</Text>
              <Text style={styles.statLabel}>Fast Sync</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

// Keep the same styles as before, just add successIcon
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  iconContainer: {
    marginBottom: 40,
  },
  syncIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  successIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  iconGradient: {
    width: "100%",
    height: "100%",
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  syncSymbol: {
    fontSize: 40,
  },
  successSymbol: {
    fontSize: 40,
  },
  content: {
    alignItems: "center",
    width: "80%",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "white",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 30,
    textAlign: "center",
  },
  stepContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  stepText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },
  progressContainer: {
    width: "100%",
    marginBottom: 40,
  },
  progressBackground: {
    height: 12,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 6,
    overflow: "hidden",
    marginBottom: 12,
  },
  progressFill: {
    height: "100%",
    borderRadius: 6,
  },
  percentageContainer: {
    alignItems: "center",
  },
  percentageText: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: 20,
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 20,
    marginBottom: 4,
  },
  statLabel: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 12,
    fontWeight: "500",
  },
});
