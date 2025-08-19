import React, { useEffect, useState } from "react";
import { Button, StyleSheet, Text, View } from "react-native";

import { CameraView, useCameraPermissions } from "expo-camera";
import { useNavigation } from "expo-router";

const QrScanner = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [data, setData] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({ title: "Update QR Scanner" });
    if (!permission) requestPermission();
  }, [permission]);

  const handleBarCodeScanned = ({ data }: any) => {
    setScanned(true);
    setData(data);
  };

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text>Need camera permission</Text>
        <Button title="Grant permission" onPress={requestPermission} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFill}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      />
      {scanned && (
        <Button title="Scan again" onPress={() => setScanned(false)} />
      )}
      {data && <Text style={styles.dataText}>Scanned Data: {data}</Text>}
    </View>
  );
};

export default QrScanner;

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  dataText: {
    position: "absolute",
    bottom: 50,
    alignSelf: "center",
    backgroundColor: "#fff",
    padding: 10,
  },
});
