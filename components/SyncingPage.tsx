import { MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

const { width } = Dimensions.get("window");

const SyncingPage = ({ percentValue }: { percentValue: number }) => {
  const rotation = useSharedValue<number>(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setProgress(percentValue);
  }, [percentValue]);

  useEffect(() => {
    // Start the rotation animation
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 1500,
        easing: Easing.linear,
      }),
      -1,
      false
    );

    // Simulate progress updates
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.random() * 10;
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.iconWrapper, animatedStyle]}>
        <MaterialIcons name="sync" size={60} color="#3498db" />
      </Animated.View>

      <Text style={styles.title}>Syncing Data</Text>
      <Text style={styles.subtitle}>
        Please wait while we sync your data to the cloud
      </Text>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>
          {Math.round(progress)}% Complete
        </Text>
      </View>

      <Text style={styles.status}>
        {progress < 100 ? "Syncing..." : "Sync Complete!"}
      </Text>
    </View>
  );
};

export default SyncingPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  iconWrapper: {
    width: 100,
    height: 100,
    marginBottom: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#7f8c8d",
    textAlign: "center",
    marginBottom: 30,
  },
  progressContainer: {
    width: "80%",
    alignItems: "center",
    marginBottom: 20,
  },
  progressBar: {
    width: "100%",
    height: 8,
    backgroundColor: "#ecf0f1",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 10,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#3498db",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: "#95a5a6",
  },
  status: {
    fontSize: 16,
    fontWeight: "600",
    color: "#3498db",
  },
});
