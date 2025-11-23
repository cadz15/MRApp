import React, { useRef, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
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
  const [signature, setSignature] = useState<string | null>(null);
  const [hasSignature, setHasSignature] = useState(false);
  const ref = useRef<any>(null);

  const handleOK = (signatureData: string) => {
    setSignature(signatureData);
    setHasSignature(true);
  };

  const handleEmpty = () => {
    console.log("Signature is empty");
    setHasSignature(false);
  };

  const handleClear = () => {
    ref.current?.clearSignature();
    setSignature(null);
    setHasSignature(false);
  };

  const handleError = (error: any) => {
    console.error("Signature pad error:", error);
    Alert.alert("Error", "Failed to capture signature");
  };

  const handleEnd = () => {
    ref.current?.readSignature();
  };

  const handleSave = () => {
    onAddItem(signature);
    onClose();
  };

  const handleCaptureSignature = (signatureData: string) => {
    onAddItem(signatureData);
    onClose();
    // Reset state for next use
    setTimeout(() => {
      setSignature(null);
      setHasSignature(false);
      if (ref.current) {
        ref.current.clearSignature();
      }
    }, 300);
  };

  const handleClose = () => {
    if (hasSignature) {
      Alert.alert(
        "Unsaved Changes",
        "You have an unsaved signature. Are you sure you want to close?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Close",
            style: "destructive",
            onPress: () => {
              setSignature(null);
              setHasSignature(false);
              onClose();
            },
          },
        ]
      );
    } else {
      onClose();
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={handleClose}
      statusBarTranslucent={true}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Signature Capture</Text>
            <Text style={styles.subtitle}>Please sign in the area below</Text>
          </View>

          <View style={styles.content}>
            {/* Preview Section - Top Left */}
            <View style={styles.previewSection}>
              <Text style={styles.sectionTitle}>Preview</Text>
              <View style={styles.previewContainer}>
                {signature ? (
                  <Image
                    resizeMode="contain"
                    style={styles.previewImage}
                    source={{ uri: signature }}
                  />
                ) : (
                  <View style={styles.previewPlaceholder}>
                    <Text style={styles.previewPlaceholderText}>
                      Signature will appear here
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Signature Canvas - Center */}
            <View style={styles.canvasSection}>
              <View style={styles.canvasContainer}>
                <SignatureCanvas
                  ref={ref}
                  onOK={handleOK}
                  onEmpty={handleEmpty}
                  onError={handleError}
                  onEnd={handleEnd}
                  autoClear={false}
                  descriptionText=""
                  clearText=""
                  confirmText=""
                  penColor="#000000"
                  backgroundColor="#ffffff"
                  webviewProps={{
                    cacheEnabled: true,
                    androidLayerType: "hardware",
                  }}
                  style={styles.signatureCanvas}
                />
                <View style={styles.canvasBorder} />
              </View>
              <Text style={styles.canvasHint}>
                Draw your signature in the box above
              </Text>
            </View>
          </View>

          {/* Action Buttons - Bottom */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.button, styles.clearButton]}
              onPress={handleClear}
            >
              <Text
                style={[
                  styles.buttonText,
                  styles.clearButtonText,
                  !hasSignature && styles.disabledButtonText,
                ]}
              >
                Clear
              </Text>
            </TouchableOpacity>

            <View style={styles.rightButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={handleClose}
              >
                <Text style={[styles.buttonText, styles.cancelButtonText]}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.button,
                  styles.saveButton,
                  !hasSignature && styles.saveButtonDisabled,
                ]}
                onPress={handleSave}
                disabled={!hasSignature}
              >
                <Text
                  style={[
                    styles.buttonText,
                    styles.saveButtonText,
                    !hasSignature && styles.disabledButtonText,
                  ]}
                >
                  Save Signature
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 20,
  },
  modalContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    width: "100%",
    maxWidth: 1000,
    flex: 1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
  },
  content: {
    flexDirection: "row",
    padding: 20,
    flex: 1,
  },
  previewSection: {
    width: 150,
    marginRight: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  previewContainer: {
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    height: 120,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
  previewPlaceholder: {
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  previewPlaceholderText: {
    fontSize: 12,
    color: "#94a3b8",
    textAlign: "center",
  },
  canvasSection: {
    flex: 1,
  },
  canvasContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#e2e8f0",
    height: 300,
    position: "relative",
    overflow: "hidden",
  },
  signatureCanvas: {
    flex: 1,
    top: -50,
    left: -50,
    backgroundColor: "red",
  },
  canvasBorder: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 6,
    pointerEvents: "none",
  },
  canvasHint: {
    fontSize: 12,
    color: "#6b7280",
    textAlign: "center",
    marginTop: 8,
    fontStyle: "italic",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    backgroundColor: "#fafafa",
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  clearButton: {
    backgroundColor: "#dc2626",
    borderWidth: 1,
    borderColor: "#dc2626",
  },
  cancelButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#6b7280",
    marginRight: 12,
  },
  saveButton: {
    backgroundColor: "#059669",
    borderWidth: 1,
    borderColor: "#059669",
  },
  saveButtonDisabled: {
    backgroundColor: "#9ca3af",
    borderColor: "#9ca3af",
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  clearButtonText: {
    color: "#fff",
  },
  cancelButtonText: {
    color: "#374151",
  },
  saveButtonText: {
    color: "#ffffff",
  },
  disabledButtonText: {
    color: "#9ca3af",
  },
  rightButtons: {
    flexDirection: "row",
  },
});

export default SignatureCapture;
