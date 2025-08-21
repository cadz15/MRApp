import { formattedCurrency } from "@/constants/Currency";
import * as ScreenOrientation from "expo-screen-orientation";
import React, { useEffect, useState } from "react";
import { FlatList, Modal, StyleSheet, Text, View } from "react-native";
import { ProductItemType } from "./SideModal";

type ModalPropType = {
  visible: boolean;
  products: ProductItemType[];
  customer: any;
  salesId: string;
  onClose: () => void;
};

type RenderItemType = {
  item: ProductItemType;
};

const SalesListModal = ({
  visible,
  products,
  customer,
  salesId,
  onClose,
}: ModalPropType) => {
  const [modalVisible, setModalVisible] = useState(visible);
  const [total, setTotal] = useState(0);

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
            <Text>{item.quantity}</Text>
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
        <Text style={styles.itemTextTotal}>
          {formattedCurrency(item.total)}
        </Text>
      </View>
    </View>
  );

  useEffect(() => {
    // Lock orientation to portrait when modal is open
    if (visible) {
      ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.PORTRAIT_UP
      );
    } else {
      // Reset orientation lock when modal is closed
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    }

    // Cleanup orientation lock on unmount
    return () => {
      ScreenOrientation.unlockAsync();
    };
  }, [modalVisible, visible]);

  useEffect(() => {
    setTotal(
      products?.reduce(
        (accumulator, currentValue) => accumulator + currentValue.total,
        0
      )
    );
  }, [products, visible]);

  return (
    <Modal
      animationType="slide"
      backdropColor={"#ddddddff"}
      visible={visible}
      onRequestClose={() => {
        setModalVisible(false);
        onClose();
      }}
    >
      <View style={styles.container}>
        <View style={styles.topContainer}>
          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>Sales ID: {salesId}</Text>
            <Text style={styles.infoText}>
              Date: {new Date().toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>Customer: {customer?.name}</Text>
          </View>
        </View>
        <View style={styles.middleContainer}>
          <FlatList
            data={products}
            renderItem={renderItem}
            keyExtractor={(item) => item.product_id.toString()}
          />
        </View>
        <View style={styles.bottomContainer}>
          <View style={styles.totalContainer}>
            <Text style={styles.totalTextDescription}>Total</Text>
            <Text style={styles.totalText}>{formattedCurrency(total)}</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    flex: 1,
    gap: 10,
  },
  topContainer: {
    padding: 12,
    backgroundColor: "#fff",
    height: "8%",
    flexShrink: 0,
  },
  middleContainer: {
    height: "80%",
    backgroundColor: "#fff",
  },
  bottomContainer: {
    flexShrink: 0,
    height: "10%",
    backgroundColor: "#fff",
  },
  infoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  infoText: {
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
  totalContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 12,
    justifyContent: "flex-end",
    padding: 12,
  },
  totalText: {
    fontWeight: "bold",
    fontSize: 30,
  },
  totalTextDescription: {
    fontWeight: "bold",
    fontSize: 18,
    color: "#616161ff",
  },
});
export default SalesListModal;
