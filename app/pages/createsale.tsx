import SideModal, { ProductItemType } from "@/components/Modal/SideModal";
import { useDB } from "@/context/DBProvider";
import { items } from "@/OfflineDB/schema";
import AntDesign from "@expo/vector-icons/AntDesign";
import Feather from "@expo/vector-icons/Feather";
import { inArray } from "drizzle-orm";
import { Link, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type RenderItemType = {
  item: ProductItemType;
};

const createsale = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItems, setSelectedItems] = useState<ProductItemType[] | []>(
    []
  );
  const [reSort, setReSort] = useState(false);
  const [editProduct, seteditProduct] = useState(null);
  const { ids } = useLocalSearchParams();

  const db = useDB();

  const handleToggleModal = () => {
    setModalVisible(!modalVisible);
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

    const price = item.product ? item.product.catalog_price : 0;

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

    const price = item.product ? item.product.catalog_price : 0;

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

  const handleSortSelectedItems = (arr: ProductItemType[]) => {
    return arr.sort((a: ProductItemType, b: ProductItemType) => {
      if (a.product.brand_name < b.product.brand_name) return -1;
      if (a.product.brand_name > b.product.brand_name) return 1;
      return 0;
    });
  };

  const getProducts = async (ids: string) => {
    const productsId = ids.split(",").map(Number);

    return await db
      .select()
      .from(items)
      .where(inArray(items.onlineId, productsId));
  };

  useEffect(() => {
    if (reSort) {
      setSelectedItems(handleSortSelectedItems(selectedItems));
      setReSort(false);
    }
  }, [selectedItems]);

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

  const renderItem = ({ item }: RenderItemType) => (
    <View style={styles.itemContainer}>
      <View style={styles.itemLeftContainer}>
        <View>
          <Text style={styles.itemTextHeader}>{item.product?.brand_name}</Text>
          <Text style={styles.itemTextDescription}>
            {item.product?.generic_name}
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
        </View>
      </View>
      <View style={[styles.itemRightContainer]}>
        <Text style={styles.itemTextTotal}>{item.total}</Text>
      </View>
    </View>
  );

  return (
    <>
      <SideModal
        visible={modalVisible}
        onClose={handleToggleModal}
        onAddItem={handleOnAddItem}
        withS3
        editItem={editProduct}
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
        <View style={styles.rightContainer}>
          <Text>createsale</Text>
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
});

export default createsale;
