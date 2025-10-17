import SalesListModal from "@/components/Modal/SalesListModal";
import SideModal, { ProductItemType } from "@/components/Modal/SideModal";
import { formattedCurrency } from "@/constants/Currency";
import { useDB } from "@/context/DBProvider";
import {
  getCustomerFromDB,
  setSalesOrder,
  totalSalesOrder,
} from "@/OfflineDB/dborm";
import { items } from "@/OfflineDB/schema";
import { getMedRepData, syncUpData } from "@/OfflineDB/sync";
import { CustomersTableType } from "@/OfflineDB/tableTypes";
import { getCurrentDate, getNowDate } from "@/utils/currentDate";
import AntDesign from "@expo/vector-icons/AntDesign";
import Feather from "@expo/vector-icons/Feather";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { inArray } from "drizzle-orm";
import { Link, router, useLocalSearchParams } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";
import React, { useEffect, useState } from "react";
import {
  Alert,
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
  customerOnlineId?: number | null;
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

  const [editProduct, setEditProduct] = useState<ProductItemType | null>(null);

  const db = useDB();

  const { id, ids } = useLocalSearchParams<{ id: string; ids: string }>();

  const handleToggleModal = () => {
    setEditProduct(null);
    setModalVisible(!modalVisible);
  };

  const handleEditProduct = (productId: number) => {
    const product = selectedItems.filter(
      (item) => item.product_id === productId
    )[0];

    setEditProduct(product);
    setModalVisible(true);
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
    try {
      if (customer && selectedItems.length >= 1) {
        const success = await setSalesOrder({
          customerId: customer.id ?? 0,
          customerOnlineId: customer?.onlineId ?? null, // set undefined if unsynced
          salesOrderNumber: salesId,
          remarks: "",
          total: total?.toString(),
          dateSold: getNowDate(),
          status: "pending",
          items: selectedItems,
        });

        if (success) {
          await syncUpData();
          router.push("/(tabs)/explore");
        } else {
          Alert.alert(
            "Error! Unable to create sales order. Please contact developer."
          );
        }
      } else {
        Alert.alert("Error! No customer or item selected.");
      }
    } catch (error) {
      console.log(error);
      Alert.alert("Error! Please contact developer.");
    }

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
              handleEditProduct(item.product_id);
            }}
          >
            <Feather name="edit-2" size={24} color="#ffb732ff" />
          </TouchableOpacity>
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

  const getProducts = async (ids: string) => {
    const productsId = ids.split(",").map(Number);

    return await db
      .select()
      .from(items)
      .where(inArray(items.onlineId, productsId));
  };

  useEffect(() => {
    getProducts(ids).then((items) => {
      items.map((item) => {
        const productData: ProductItemType = {
          product_id: item.id,
          product: item,
          quantity: 1,
          promo: "regular",
          total: 1 * parseFloat(item.catalogPrice),
        };

        handleOnAddItem(productData);
      });
    });
  }, [ids]);

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
          const validatityDate = getCurrentDate(customer[0].s3Validity);
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

    totalSalesOrder().then((total) => {
      getMedRepData().then((medrep) => {
        setSalesId(
          `${medrep[0].onlineId?.toString().padStart(2, "0")}-${(total + 1)
            .toString()
            .padStart(4, "0")}`
        );
      });
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
        editItem={editProduct}
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
