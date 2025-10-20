import React, { useRef, useState } from "react";
import { Image, Modal, StyleSheet, View } from "react-native";
import SignatureCanvas from "react-native-signature-canvas";

function SignatureCapture({
  visible,
  onClose,
  onAddItem,
}: {
  visible: boolean;
  onClose: () => void;
  onAddItem: (signature: string) => void;
}) {
  const [modalVisible, setModalVisible] = useState(visible);
  const [signature, setSignature] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const ref = useRef(null);

  const handleSignature = (signature) => {
    setSignature(signature);
    setIsLoading(false);
    onAddItem(signature);
  };

  const handleEmpty = () => {
    console.log("Signature is empty");
    setIsLoading(false);
  };

  const handleClear = () => {
    console.log("Signature cleared");
    setSignature(null);
  };

  const handleError = (error: any) => {
    console.error("Signature pad error:", error);
    setIsLoading(false);
  };

  const handleEnd = () => {
    setIsLoading(true);

    ref.current?.readSignature();
  };

  return (
    <Modal
      animationType="slide"
      backdropColor={"#ddddddff"}
      visible={visible}
      onRequestClose={() => {
        setModalVisible(false);
        onAddItem(signature ?? "");
        onClose();
      }}
    >
      <View style={styles.container}>
        <View style={styles.preview}>
          {signature && (
            <Image
              resizeMode="contain"
              style={{ width: 335, height: 114 }}
              source={{ uri: signature }}
            />
          )}
        </View>

        <SignatureCanvas
          ref={ref}
          onEnd={handleEnd}
          onOK={handleSignature}
          onEmpty={handleEmpty}
          onClear={handleClear}
          onError={handleError}
          autoClear={true}
          descriptionText="Sign here"
          clearText="Clear"
          confirmText={isLoading ? "Processing..." : "Save"}
          penColor="#000000"
          backgroundColor="rgba(255,255,255,0)"
          webviewProps={{
            // Custom WebView optimization
            cacheEnabled: true,
            androidLayerType: "hardware",
          }}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
  preview: {
    position: "absolute",
    width: 335,
    height: 114,
    backgroundColor: "#F8F8F8",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 15,
    top: 0,
    left: 0,
    zIndex: 99,
  },
});
export default SignatureCapture;
