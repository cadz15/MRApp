import AppButton from "@/components/AppButton";
import AntDesign from "@expo/vector-icons/AntDesign";
import React, { useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import QrScanner from "./qrscanner";

const FirstLoading = () => {
  const rotation = useSharedValue<number>(0);
  const [showCamera, setShowCamera] = useState(false);

  const handleRequestPermision = () => {
    setShowCamera(!showCamera);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));
  return (
    <>
      {showCamera ? (
        <QrScanner />
      ) : (
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

          <Text style={styles.title}>
            Welcome to I.conTrade Pharmaceutical S.O. App
          </Text>
          <Text style={styles.subtitle}>
            Please scan the QR to complete the setup.
          </Text>
          <AppButton
            onPress={handleRequestPermision}
            asLink={false}
            link={"/qrscanner"}
            style={styles.button}
          >
            <AntDesign
              name="qrcode"
              size={24}
              color="black"
              style={{ color: "#5c5c5cff" }}
            />
            <Text style={{ color: "#5c5c5cff" }}>Scan QR now</Text>
          </AppButton>
        </View>
      )}
    </>
  );
};

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
  button: {
    backgroundColor: "#fff",
    marginTop: 12,
    gap: 12,
    flexDirection: "row",
  },
});

export default FirstLoading;
