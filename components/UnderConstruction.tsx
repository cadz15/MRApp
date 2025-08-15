import React, { useEffect } from "react";
import { Dimensions, Image, StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

const { width } = Dimensions.get("window");

const UnderConstruction: React.FC = () => {
  const rotation = useSharedValue<number>(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 4000,
        easing: Easing.linear,
      }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.imageWrapper, animatedStyle]}>
        <Image
          source={{
            uri: "https://www.iconpacks.net/icons/1/free-gear-icon-1213-thumb.png",
          }}
          style={styles.image}
          resizeMode="contain"
        />
      </Animated.View>

      <Text style={styles.title}>Under Construction</Text>
      <Text style={styles.subtitle}>
        This page is currently being worked on 🚧
      </Text>
    </View>
  );
};

export default UnderConstruction;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff8e1",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  imageWrapper: {
    width: 150,
    height: 150,
    marginBottom: 30,
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#f39c12",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#7f8c8d",
    textAlign: "center",
  },
});
