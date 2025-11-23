import SignatureCapture from "@/components/Modal/SignatureCapture";
import { getCustomerFromLocalDB } from "@/OfflineDB/dborm";
import { uploadDcr } from "@/OfflineDB/sync";
import { CustomersTableType } from "@/OfflineDB/tableTypes";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const todayDate = () => {
  const today = new Date();
  return today
    .toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
    .replace(/^([A-Za-z]+)( )/, "$1. ");
};

const createDailyCall = () => {
  const [customerData, setCustomerData] = useState<CustomersTableType | null>(
    null
  );
  const [modalVisible, setModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { id } = useLocalSearchParams<{ id: string }>();

  // 🧠 Form state
  const [form, setForm] = useState({
    name: "",
    customerId: parseInt(id),
    customerOnlineId: null,
    dcrDate: todayDate(),
    practice: "",
    signature: "",
    remarks: "",
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleSignature = (signatureCode: string) => {
    setForm((prev) => ({ ...prev, signature: signatureCode }));
  };

  const handleToggleModal = () => {
    setModalVisible(!modalVisible);
  };

  const handleChange = (field: string, value: string | number | null) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!form.name) newErrors.name = "Customer name is required";
    if (!form.practice) newErrors.practice = "Address is required";
    return newErrors;
  };

  const onSubmit = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    try {
      const result = await uploadDcr(form);
      if (result) {
        Alert.alert("Success", "DCR created successfully", [
          { text: "OK", onPress: () => router.back() },
        ]);
      } else {
        Alert.alert("Error", "Unable to save DCR online.", [
          { text: "OK", onPress: () => router.back() },
        ]);
      }
    } catch (error) {
      console.error("DCR creation error:", error);
      Alert.alert("Error", "Failed to create DCR");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const loadCustomerData = async () => {
      const res = await getCustomerFromLocalDB(parseInt(id));
      setCustomerData(res);

      if (res) {
        setForm((prev) => ({
          ...prev,
          name: res.name || "",
          customerOnlineId: res.onlineId || null,
          practice: res.practice || "",
        }));
      }
    };

    loadCustomerData();
  }, [id]);

  return (
    <>
      <SignatureCapture
        visible={modalVisible}
        onClose={handleToggleModal}
        onAddItem={handleSignature}
      />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <ScrollView style={styles.formContainer}>
          <Text style={styles.header}>Add new DCR</Text>
          <View style={styles.form}>
            {/* Customer Name (Hidden ID field) */}
            <View
              style={[styles.inputGroup, { position: "absolute", opacity: 0 }]}
            >
              <Text style={styles.label}>Customer Id*</Text>
              <TextInput
                style={styles.input}
                value={String(form.customerOnlineId || "")}
                editable={false}
              />
            </View>

            {/* Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Customer Name *</Text>
              <TextInput
                style={styles.input}
                value={form.name}
                onChangeText={(text) => handleChange("name", text)}
                placeholder="Enter customer name"
              />
              {errors.name && (
                <Text style={styles.errorText}>{errors.name}</Text>
              )}
            </View>

            {/* Practice/Address */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Practice/Address *</Text>
              <TextInput
                style={[styles.input, styles.multilineInput]}
                multiline
                numberOfLines={3}
                value={form.practice}
                onChangeText={(text) => handleChange("practice", text)}
                placeholder="Juan Luna St. Ormoc City, Leyte"
              />
              {errors.practice && (
                <Text style={styles.errorText}>{errors.practice}</Text>
              )}
            </View>

            {/* Signature */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Signature</Text>
              <TouchableOpacity
                onPress={handleToggleModal}
                style={form.signature ? styles.inputGreen : styles.input}
              >
                <Text>Click to capture signature</Text>
              </TouchableOpacity>
              {errors.signature && (
                <Text style={styles.errorText}>{errors.signature}</Text>
              )}
            </View>

            {/* Remarks */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Remarks</Text>
              <TextInput
                style={[styles.input, styles.multilineInput]}
                multiline
                numberOfLines={3}
                value={form.remarks}
                onChangeText={(text) => handleChange("remarks", text)}
                placeholder="Enter any remarks"
              />
            </View>

            {/* Form Actions */}
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => router.back()}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.submitButton]}
                onPress={onSubmit}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Save DCR</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, marginHorizontal: "auto", paddingVertical: 14 },
  formContainer: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 16,
    marginBottom: 12,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  form: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 16, fontWeight: "600", marginBottom: 8, color: "#333" },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  inputGreen: {
    borderWidth: 1,
    borderColor: "#37f726ff",
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  multilineInput: { minHeight: 80, textAlignVertical: "top" },
  errorText: { color: "#d9534f", fontSize: 14, marginTop: 4 },
  button: {
    borderRadius: 6,
    padding: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  submitButton: { backgroundColor: "#007bff", flex: 1, marginLeft: 10 },
  cancelButton: { backgroundColor: "#dc3545", flex: 1, marginRight: 10 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  formGroup: {
    flexDirection: "row",
    gap: 8,
    width: "100%",
  },
});

export default createDailyCall;
