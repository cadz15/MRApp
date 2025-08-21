import SalesListModal from "@/components/Modal/SalesListModal";
import SideModal, { ProductItemType } from "@/components/Modal/SideModal";
import { formattedCurrency } from "@/constants/Currency";
import { getCustomerFromDB, setSalesOrder } from "@/OfflineDB/dborm";
import { CustomersTableType } from "@/OfflineDB/tableTypes";
import AntDesign from "@expo/vector-icons/AntDesign";
import Feather from "@expo/vector-icons/Feather";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Link, useLocalSearchParams } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import NotFoundScreen from "../+not-found";

type RenderItemType = {
  item: ProductItemType;
};

export type CreateSalesOrderType = {
  customerId: number;
  medicalRepresentativeId?: number;
  salesOrderNumber: string;
  dateSold: string;
  total: string;
  remarks?: string;
  syncDate?: string;
  status: string;
  items: ProductItemType[];
};

const CreateSalesOrder = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [modalSalesPreviewVisible, setModalSalesPreviewVisible] =
    useState(false);
  const [selectedItems, setSelectedItems] = useState<ProductItemType[] | []>(
    []
  );
  const [reSort, setReSort] = useState(false);
  const [customer, setCustomer] = useState<CustomersTableType | null>(null);
  const [total, setTotal] = useState(0);
  const [salesId, setSalesId] = useState(
    Math.random().toString(36).substr(2, 7)
  );
  const [withS3, setWithS3] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { id } = useLocalSearchParams<{ id: string }>();

  const handleToggleModal = () => {
    setModalVisible(!modalVisible);
  };

  const handlePreviewModal = () => {
    if (customer && selectedItems) {
      setModalSalesPreviewVisible(!modalSalesPreviewVisible);
    }
  };

  const handleOnAddItem = (productItem: ProductItemType) => {
    const item = selectedItems.filter(
      (item) => item.product_id === productItem.product_id
    );

    if (item) {
      setSelectedItems((prevState) => [
        ...selectedItems.filter(
          (item) => item.product_id !== productItem.product_id
        ),
        productItem,
      ]);
    } else {
      setSelectedItems((prevState) => [...selectedItems, productItem]);
    }
    setReSort(true);
  };

  const addQuantity = (id: number) => {
    let item = selectedItems?.filter((item) => item.product_id === id)[0];
    let discount =
      item?.promo === "discount" ? (item?.discount ? item.discount : 0) : 0;

    if (!item) return null;

    const price = item.product ? item.product.catalogPrice : 0;

    item.quantity += 1;

    let total = item.quantity * parseFloat(price.toString());

    item.total = total - discount;

    setReSort(true);
    setSelectedItems((prevState) => [
      ...prevState?.filter((item) => item.product_id !== id),
      item,
    ]);
  };

  const deductQuantity = (id: number) => {
    let item = selectedItems?.filter((item) => item.product_id === id)[0];
    let discount =
      item?.promo === "discount" ? (item?.discount ? item.discount : 0) : 0;

    if (!item) return null;

    const price = item.product ? item.product.catalogPrice : 0;

    if (item.quantity > 1) {
      item.quantity -= 1;
    } else {
      item.quantity = 1;
    }

    let total = item.quantity * parseFloat(price.toString());

    item.total = total - discount;

    setReSort(true);
    setSelectedItems((prevState) => [
      ...prevState?.filter((item) => item.product_id !== id),
      item,
    ]);
  };

  const handleDeleteItem = (id: number) => {
    const item = selectedItems?.filter((item) => item.product_id === id)[0];

    setReSort(true);
    setSelectedItems((prevState) => [
      ...prevState?.filter((item) => item.product_id !== id),
    ]);
  };

  const handleCreateSales = async () => {
    setIsSubmitting(true);
    await setSalesOrder({
      customerId: customer?.id,
      salesOrderNumber: salesId,
      remarks: "",
      total: total?.toString(),
      dateSold: new Date().toLocaleDateString(),
      status: "pending",
      items: selectedItems,
    });

    setIsSubmitting(false);
  };

  const handleSortSelectedItems = (arr: ProductItemType[]) => {
    return arr.sort((a: ProductItemType, b: ProductItemType) => {
      if (a.product?.brandName < b.product?.brandName) return -1;
      if (a.product?.brandName > b.product?.brandName) return 1;
      return 0;
    });
  };

  const renderItem = ({ item }: RenderItemType) => (
    <View style={styles.itemContainer}>
      <View style={styles.itemLeftContainer}>
        <View>
          <Text style={styles.itemTextHeader}>{item.product?.brandName}</Text>
          <Text style={styles.itemTextDescription}>
            {item.product?.genericName}
          </Text>
        </View>
        {item.remarks && (
          <Text style={styles.itemTextRemarks}>{item.remarks}</Text>
        )}
        <View style={styles.itemBottomContainer}>
          <View style={styles.itemQuantityContainer}>
            <Text>Quantity: </Text>
            <TouchableOpacity onPress={() => deductQuantity(item.product_id)}>
              <Feather name="chevron-left" size={24} color="black" />
            </TouchableOpacity>
            <Text>{item.quantity}</Text>
            <TouchableOpacity onPress={() => addQuantity(item.product_id)}>
              <Feather name="chevron-right" size={24} color="black" />
            </TouchableOpacity>
          </View>
          {item.promo !== "regular" ? (
            item.promo === "free" ? (
              <Text style={styles.itemFreeText}>
                {item.freeItemQuantity} free Item
              </Text>
            ) : (
              <Text style={styles.itemDiscountText}>
                {item.discount} Discount
              </Text>
            )
          ) : null}

          <TouchableOpacity
            onPress={() => {
              handleDeleteItem(item.product_id);
            }}
          >
            <Feather name="trash-2" size={24} color="#ff3232ff" />
          </TouchableOpacity>
        </View>
      </View>
      <View style={[styles.itemRightContainer]}>
        <Text style={styles.itemTextTotal}>
          {formattedCurrency(item.total)}
        </Text>
      </View>
    </View>
  );

  useEffect(() => {
    if (reSort) {
      setSelectedItems(handleSortSelectedItems(selectedItems));
      setTotal(
        selectedItems?.reduce(
          (accumulator, currentValue) => accumulator + currentValue.total,
          0
        )
      );
      setReSort(false);
    }
  }, [selectedItems]);

  useEffect(() => {
    getCustomerFromDB(parseInt(id)).then((customer) => {
      if (customer) {
        setCustomer(customer[0]);
        if (customer[0]?.s3License) {
          const validatityDate = new Date(customer[0].s3Validity);
          const nowDate = new Date();

          if (validatityDate >= nowDate) {
            setWithS3(true);
          } else {
            setWithS3(false);
          }
        }
      } else {
        <NotFoundScreen />;
      }
    });
  }, [id]);

  useEffect(() => {
    if (!modalSalesPreviewVisible) {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    }
  }, [modalSalesPreviewVisible]);

  return (
    <>
      <SideModal
        visible={modalVisible}
        onClose={handleToggleModal}
        onAddItem={handleOnAddItem}
        withS3={withS3}
      />

      <SalesListModal
        products={selectedItems}
        customer={customer}
        salesId={salesId}
        onClose={handlePreviewModal}
        visible={modalSalesPreviewVisible}
      />
      <View style={styles.container}>
        <View style={styles.leftContainer}>
          <View style={styles.leftHeader}>
            <Link href={"/(tabs)/explore"}>
              <Feather name="arrow-left" size={24} color="black" />
            </Link>
            <Text style={styles.lefHeaderTitle}>Create Sales Order</Text>
          </View>

          <View style={styles.leftMainContainer}>
            <TouchableOpacity
              style={styles.selectProductInput}
              onPress={handleToggleModal}
            >
              <Text>Select Product</Text>
              <Feather name="chevron-down" size={24} color="black" />
            </TouchableOpacity>

            <Text style={styles.textHeader}>Items Information</Text>
            <View style={{ height: "76%" }}>
              {selectedItems.length ? (
                <FlatList
                  data={selectedItems}
                  renderItem={renderItem}
                  keyExtractor={(item) => item.product_id.toString()}
                />
              ) : (
                <View style={styles.emptyItemContainer}>
                  <AntDesign name="select1" size={60} color="#8a8a8aff" />
                  <Text
                    style={{
                      fontWeight: "bold",
                      fontSize: 20,
                      color: "#8a8a8aff",
                    }}
                  >
                    No Product Selected
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
        <View style={styles.rightContainer}>
          <Text>Sales Information</Text>

          <View style={styles.inputContainer}>
            <Text>Sales Order ID</Text>
            <TextInput style={styles.input} value={salesId} readOnly />
          </View>
          <View style={styles.inputContainer}>
            <Text>Customer</Text>
            <TextInput style={styles.input} value={customer?.name} readOnly />
          </View>
          <View style={styles.inputContainer}>
            <Text>Date</Text>
            <TextInput
              style={styles.input}
              value={new Date().toLocaleDateString()}
              readOnly
            />
          </View>

          <View style={styles.totalSalesContainer}>
            <Text style={styles.totalSalesDescription}>Total</Text>
            <Text style={styles.totalSalesText}>
              {formattedCurrency(total)}
            </Text>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: "#da9c17ff" }]}
              onPress={handlePreviewModal}
            >
              <MaterialIcons name="preview" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, { flex: 1 }]}
              disabled={isSubmitting}
              onPress={handleCreateSales}
            >
              {isSubmitting ? (
                <Text style={styles.buttonText}>Creating....</Text>
              ) : (
                <Text style={styles.buttonText}>Create Sales Order</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
  },
  leftContainer: {
    flex: 1,
    flexDirection: "column",
  },
  rightContainer: {
    backgroundColor: "#fff",
    width: 300,
    flexShrink: 0,
    flexDirection: "column",
    gap: 4,
    padding: 12,
  },
  leftHeader: {
    padding: 12,
    flexDirection: "row",
    gap: 16,
    marginTop: 12,
  },
  lefHeaderTitle: {
    fontWeight: "bold",
    fontSize: 16,
  },
  leftMainContainer: {
    flexDirection: "column",
    padding: 24,
    marginTop: 6,
    gap: 12,
  },
  selectProductInput: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderColor: "#b9b9b9ff",
    backgroundColor: "#fff",
    padding: 12,
  },
  textHeader: {
    fontWeight: "bold",
    fontSize: 16,
  },
  itemContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 8,
    marginBottom: 8,
  },
  itemLeftContainer: {
    flexDirection: "column",
    flex: 1,
    gap: 8,
  },
  itemRightContainer: {
    minWidth: "15%",
    justifyContent: "center",
    alignItems: "center",
  },
  itemTextHeader: {
    fontWeight: "bold",
    fontSize: 16,
  },
  itemTextDescription: {
    fontSize: 12,
    color: "#616161ff",
  },
  itemTextRemarks: {
    fontSize: 12,
    fontStyle: "italic",
    padding: 8,
    backgroundColor: "#f0f0f0ff",
    borderRadius: 4,
  },
  itemBottomContainer: {
    flexDirection: "row",
    gap: 8,
  },
  itemQuantityContainer: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  itemTextTotal: {
    fontWeight: "bold",
    fontSize: 18,
  },
  itemFreeText: {
    color: "#569efcff",
    fontWeight: "bold",
  },
  itemDiscountText: {
    color: "#ffc445ff",
    fontWeight: "bold",
  },
  emptyItemContainer: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  inputContainer: {
    marginBottom: 4,
  },
  input: {
    backgroundColor: "#f5f4f4ff",
    borderRadius: 4,
  },
  totalSalesContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14,
    alignItems: "center",
  },
  totalSalesDescription: {
    fontWeight: "bold",
    color: "#b9b9b9ff",
    fontSize: 16,
  },
  totalSalesText: {
    fontWeight: "bold",
    fontSize: 20,
  },
  button: {
    backgroundColor: "#015835",
    padding: 10,
    borderRadius: 4,
    marginTop: 12,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
  },

  buttonContainer: {
    flexDirection: "row",
    gap: 12,
  },
});

export default CreateSalesOrder;
