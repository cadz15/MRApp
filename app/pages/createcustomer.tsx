import { uploadCustomer } from "@/OfflineDB/sync";
import { CustomersTableType } from "@/OfflineDB/tableTypes";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
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

type FormData = Omit<
  CustomersTableType,
  "id" | "onlineId" | "syncDate" | "createdAt" | "updatedAt" | "deletedAt"
>;

const regions = [
  "Region 1",
  "Region 2",
  "Region 3",
  "Region 4A",
  "Region 4B",
  "Region 5",
  "Region 6",
  "Region 7",
  "Region 8",
  "Region 9",
  "Region 10",
  "Region 11",
  "Region 12",
  "CAR",
  "NCR",
  "ARMM",
  "CARAGA",
  "BARMM",
];

const CreateCustomer = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      name: "",
      fullAddress: "",
      shortAddress: "",
      region: "",
      class: "",
      practice: "",
      s3License: "",
      s3Validity: "",
      pharmacistName: "",
      prcId: "",
      prcValidity: "",
      remarks: "",
    },
  });

  const onSubmit = async (data: CustomersTableType) => {
    setIsLoading(true);
    try {
      const result = await uploadCustomer(data);

      if (result) {
        Alert.alert("Success", "Customer created successfully", [
          { text: "OK", onPress: () => router.back() },
        ]);
      } else {
        Alert.alert("Error", "Unable to save customer online.");
      }
    } catch (error) {
      console.error("Customer creation error:", error);
      Alert.alert("Error", "Failed to create customer");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
      <ScrollView style={styles.formContainer}>
        <Text style={styles.header}>Add New Customer</Text>
        <View style={styles.form}>
          {/* Customer Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Customer Name *</Text>
            <Controller
              control={control}
              rules={{ required: "Customer name is required" }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.input}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholder="Enter customer name"
                />
              )}
              name="name"
            />
            {errors.name && (
              <Text style={styles.errorText}>{errors.name.message}</Text>
            )}
          </View>
          {/* Full Address */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Address *</Text>
            <Controller
              control={control}
              rules={{ required: "Full address is required" }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, styles.multilineInput]}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholder="Juan Luna St. Ormoc City, Leyte"
                  multiline
                  numberOfLines={3}
                />
              )}
              name="fullAddress"
            />
            {errors.fullAddress && (
              <Text style={styles.errorText}>{errors.fullAddress.message}</Text>
            )}
          </View>
          <View style={styles.formGroup}>
            {/* Short Address */}
            <View style={[styles.inputGroup, { width: "50%" }]}>
              <Text style={styles.label}>Short Address *</Text>
              <Controller
                control={control}
                rules={{ required: "Short address is required" }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={styles.input}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    placeholder="Ex. Ormoc City"
                  />
                )}
                name="shortAddress"
              />
              {errors.shortAddress && (
                <Text style={styles.errorText}>
                  {errors.shortAddress.message}
                </Text>
              )}
            </View>
            {/* Region */}
            <View style={[styles.inputGroup, { width: "50%" }]}>
              <Text style={styles.label}>Region *</Text>
              <Controller
                control={control}
                rules={{ required: "Region is required" }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <Picker
                    selectedValue={value}
                    onValueChange={onChange} // Update on value change
                    style={{ backgroundColor: "#eeeeeeff" }}
                  >
                    {regions.map((region, index) => (
                      <Picker.Item label={region} value={region} key={index} />
                    ))}
                  </Picker>
                )}
                name="region"
              />
              {errors.region && (
                <Text style={styles.errorText}>{errors.region.message}</Text>
              )}
            </View>
          </View>
          <View style={styles.formGroup}>
            {/* Class */}
            <View style={[styles.inputGroup, { width: "50%" }]}>
              <Text style={styles.label}>Class *</Text>
              <Controller
                control={control}
                rules={{ required: "Class is required" }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={styles.input}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    placeholder="Enter class"
                  />
                )}
                name="class"
              />
              {errors.class && (
                <Text style={styles.errorText}>{errors.class.message}</Text>
              )}
            </View>
            {/* Practice */}
            <View style={[styles.inputGroup, { width: "50%" }]}>
              <Text style={styles.label}>Practice</Text>
              <Controller
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={styles.input}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value || ""}
                    placeholder="Enter practice"
                  />
                )}
                name="practice"
              />
            </View>
          </View>
          <View style={styles.formGroup}>
            {/* S3 License */}
            <View style={[styles.inputGroup, { width: "50%" }]}>
              <Text style={styles.label}>S3 License</Text>
              <Controller
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={styles.input}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value || ""}
                    placeholder="Enter S3 license number"
                  />
                )}
                name="s3License"
              />
            </View>
            {/* S3 Validity */}
            <View style={[styles.inputGroup, { width: "50%" }]}>
              <Text style={styles.label}>S3 Validity</Text>
              <Controller
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={styles.input}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value || ""}
                    placeholder="Enter S3 validity date"
                  />
                )}
                name="s3Validity"
              />
            </View>
          </View>
          {/* Pharmacist Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Pharmacist Name</Text>
            <Controller
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.input}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value || ""}
                  placeholder="Enter pharmacist name"
                />
              )}
              name="pharmacistName"
            />
          </View>
          <View style={styles.formGroup}>
            {/* PRC ID */}
            <View style={[styles.inputGroup, { width: "50%" }]}>
              <Text style={styles.label}>PRC ID</Text>
              <Controller
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={styles.input}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value || ""}
                    placeholder="Enter PRC ID"
                  />
                )}
                name="prcId"
              />
            </View>
            {/* PRC Validity */}
            <View style={[styles.inputGroup, { width: "50%" }]}>
              <Text style={styles.label}>PRC Validity</Text>
              <Controller
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={styles.input}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value || ""}
                    placeholder="Enter PRC validity date"
                  />
                )}
                name="prcValidity"
              />
            </View>
          </View>
          {/* Remarks */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Remarks</Text>
            <Controller
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, styles.multilineInput]}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value || ""}
                  placeholder="Enter any remarks"
                  multiline
                  numberOfLines={3}
                />
              )}
              name="remarks"
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
              onPress={handleSubmit(onSubmit)}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Save Customer</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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

export default CreateCustomer;
