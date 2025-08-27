import { formattedCurrency } from "@/constants/Currency";
import { getItemsFromDB } from "@/OfflineDB/dborm";
import { ItemsTableType } from "@/OfflineDB/tableTypes";
import AntDesign from "@expo/vector-icons/AntDesign";
import { Picker } from "@react-native-picker/picker";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type SideModalType = {
  visible: boolean;
  onClose: () => void;
  onAddItem: (product: ProductItemType) => void;
  withS3: boolean;
};

export type ProductType = {
  id: number;
  brand_name: string;
  generic_name: string;
  milligrams: string;
  supply: string;
  catalog_price: number;
  product_type: string;
};

type RenderItemType = {
  item: ItemsTableType;
  index: number;
};

export type ProductItemType = {
  product_id: number;
  product?: ItemsTableType;
  quantity: number;
  promo: string;
  discount?: number;
  freeItemQuantity?: number;
  freeItemRemarks?: string;
  remarks?: string;
  total: number;
};

const SideModal = ({ visible, onClose, onAddItem, withS3 }: SideModalType) => {
  const [showModal, setShowModal] = useState(visible);
  const [filteredProductData, setFilteredProductData] = useState<
    ItemsTableType[] | null
  >(null);
  const [total, setTotal] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState<
    ItemsTableType | undefined
  >(undefined);
  const [productItem, setProductItem] = useState<ProductItemType>({
    product_id: 0,
    promo: "regular",
    quantity: 1,
    total: 0,
  });
  const [items, setItems] = useState<ItemsTableType[] | null>(null);

  const handleClickItem = (id: number) => {
    setSelectedProduct(items?.filter((item) => item.id === id)[0]);
  };

  const handleCalculateTotal = (quantity: number, discount?: number) => {
    const total =
      quantity *
      parseFloat(
        selectedProduct ? selectedProduct?.catalogPrice?.toString() : "0"
      );

    setProductItem((prevState) => ({
      ...prevState,
      total: total,
    }));

    setTotal(total);

    if (discount) {
      setTotal(total - discount);

      setProductItem((prevState) => ({
        ...prevState,
        total: total - discount,
      }));
    }
  };

  const handleSearch = (text: string) => {
    if (text) {
      if (items) {
        setFilteredProductData(
          items.filter((item) =>
            item.brandName?.toLowerCase().includes(text.toLowerCase())
          )
        );
      }
    } else {
      setFilteredProductData(items);
    }
  };

  const handleAddItem = () => {
    if (
      productItem.promo === "free" &&
      !productItem?.freeItemQuantity &&
      !productItem?.freeItemRemarks
    ) {
      alert("Please Add Free Item Quantity");
    } else if (productItem.promo === "discount" && !productItem?.discount) {
      alert("Please Add Discount");
    } else {
      setSelectedProduct(undefined);
      onAddItem(productItem);
    }
  };

  const renderItem = ({ item, index }: RenderItemType) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => handleClickItem(item.id)}
    >
      <View style={styles.itemLeftSide}>
        <Text style={styles.itemTextHeader}>{item.brandName}</Text>
        <Text style={styles.itemTextDescription}>{item.genericName}</Text>
        <View style={styles.itemLeftBottomSide}>
          <Text style={styles.itemSubText}>{item.milligrams}</Text>
          <Text style={styles.itemSubText}>{item.supply}</Text>
          <Text style={styles.productExclusive}>{item.productType}</Text>
        </View>
      </View>
      <View style={styles.itemRighSide}>
        <Text style={styles.itemTextHeader}>
          {formattedCurrency(item.catalogPrice)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  useEffect(() => {
    getItemsFromDB(withS3).then((items) => {
      setItems(items);
      setFilteredProductData(items);
    });
  }, [withS3]);

  useEffect(() => {
    if (selectedProduct) {
      setProductItem({
        product_id: selectedProduct.id,
        promo: "regular",
        quantity: 1,
        product: selectedProduct,
        total: 0,
      });
      try {
        handleCalculateTotal(1);
      } catch (error) {
        console.log("error on handleCalculate(): ", error);
      }
    }
  }, [selectedProduct]);

  useEffect(() => {
    setSelectedProduct(undefined);
  }, [visible]);

  return (
    <Modal
      backdropColor={"#e0e0e0ff"}
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.leftContainer}>
          <TextInput
            placeholder="Search product by brand name"
            style={styles.leftSearchTextInput}
            onChangeText={handleSearch}
          />

          <FlatList
            data={filteredProductData}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
          />
        </View>
        <View style={styles.rightContainer}>
          {selectedProduct === undefined ? (
            <View style={styles.productInformationContainer}>
              <View
                style={[
                  styles.productInformationContainerScroll,
                  { justifyContent: "center", alignItems: "center" },
                ]}
              >
                <AntDesign name="select1" size={60} color="#8a8a8aff" />
                <Text
                  style={{
                    fontWeight: "bold",
                    fontSize: 20,
                    color: "#8a8a8aff",
                  }}
                >
                  Select Item to add
                </Text>
              </View>
              <View style={styles.productInformationBottom}></View>
            </View>
          ) : (
            <View style={styles.productInformationContainer}>
              <ScrollView style={styles.productInformationContainerScroll}>
                <Text style={[styles.itemTextHeader, { marginBottom: 8 }]}>
                  Product Information
                </Text>
                <View style={styles.inputContainer}>
                  <Text>Brand Name</Text>
                  <TextInput
                    placeholder="Brand Name"
                    readOnly
                    style={styles.input}
                    value={selectedProduct?.brandName ?? ""}
                  />
                </View>
                <View style={styles.inputContainer}>
                  <Text>Generic Name</Text>
                  <TextInput
                    placeholder="Generic Name"
                    readOnly
                    style={styles.input}
                    value={selectedProduct?.genericName ?? ""}
                  />
                </View>
                <View style={styles.inputGroup}>
                  <View style={styles.inputContainer}>
                    <Text>Supply</Text>
                    <TextInput
                      placeholder="Supply"
                      readOnly
                      style={styles.input}
                      value={selectedProduct?.supply ?? ""}
                    />
                  </View>
                  <View style={styles.inputContainer}>
                    <Text>Price</Text>
                    <TextInput
                      placeholder="Price"
                      readOnly
                      style={styles.input}
                      value={selectedProduct?.catalogPrice.toString()}
                    />
                  </View>
                </View>

                <View style={styles.inputContainer}>
                  <Text>Quantity</Text>
                  <TextInput
                    placeholder="Quantity"
                    keyboardType="number-pad"
                    style={styles.input}
                    defaultValue="1"
                    value={productItem?.quantity.toString()}
                    onChangeText={(text) => {
                      setProductItem((prevState) => ({
                        ...prevState,
                        quantity: text.trim() === "" ? 0 : parseInt(text),
                      }));
                      handleCalculateTotal(parseInt(text));
                    }}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text>Promo</Text>
                  <Picker
                    selectedValue={productItem.promo}
                    onValueChange={(itemValue, itemIndex) => {
                      setProductItem((prevState) => ({
                        ...prevState,
                        promo: itemValue,
                        discount:
                          itemValue === "regular" || itemValue === "free"
                            ? 0
                            : prevState.discount,
                        freeItemQuantity:
                          itemValue === "regular" || itemValue === "discount"
                            ? 0
                            : prevState.freeItemQuantity,
                        freeItemRemarks:
                          itemValue === "regular" || itemValue === "discount"
                            ? ""
                            : prevState.freeItemRemarks,
                      }));

                      if (itemValue === "regular") {
                        handleCalculateTotal(
                          parseInt(productItem?.quantity.toString())
                        );
                      }
                    }}
                    style={styles.input}
                  >
                    <Picker.Item label={"Regular"} value={"regular"} />
                    <Picker.Item label={"With Free"} value={"free"} />
                    <Picker.Item label={"Discount"} value={"discount"} />
                  </Picker>
                </View>

                {productItem?.promo !== "regular" ? (
                  productItem?.promo === "free" ? (
                    <View style={styles.promoFreeItemContainer}>
                      <View style={styles.inputContainer}>
                        <Text>Free Item Quantity</Text>
                        <TextInput
                          placeholder="Free Item Quantity"
                          keyboardType="numeric"
                          style={styles.input}
                          value={productItem?.freeItemQuantity?.toString()}
                          onChangeText={(text) =>
                            setProductItem((prevState) => ({
                              ...prevState,
                              freeItemQuantity: parseInt(text),
                            }))
                          }
                        />
                      </View>
                      <View style={styles.inputContainer}>
                        <Text>Free Item Remarks</Text>
                        <TextInput
                          placeholder="Free Item Remarks"
                          style={styles.input}
                          value={productItem?.freeItemRemarks}
                          onChangeText={(text) =>
                            setProductItem((prevState) => ({
                              ...prevState,
                              freeItemRemarks: text,
                            }))
                          }
                        />
                      </View>
                    </View>
                  ) : (
                    <View>
                      <View style={styles.inputContainer}>
                        <Text>Discount</Text>
                        <TextInput
                          placeholder="Discount "
                          keyboardType="numeric"
                          style={styles.input}
                          value={productItem?.discount?.toString()}
                          onChangeText={(text) => {
                            setProductItem((prevState) => ({
                              ...prevState,
                              discount: text.trim() === "" ? 0 : parseInt(text),
                            }));
                            handleCalculateTotal(
                              parseInt(productItem?.quantity.toString()),
                              parseInt(text)
                            );
                          }}
                        />
                      </View>
                    </View>
                  )
                ) : null}

                <View style={styles.inputContainer}>
                  <Text>Remarks</Text>
                  <TextInput
                    placeholder="Remarks"
                    multiline
                    numberOfLines={2}
                    style={styles.input}
                    value={productItem?.remarks}
                    onChangeText={(text) =>
                      setProductItem((prevState) => ({
                        ...prevState,
                        remarks: text,
                      }))
                    }
                  />
                </View>
              </ScrollView>
              <View style={styles.productInformationBottom}>
                <View style={styles.productTotal}>
                  <Text style={styles.productTotalText}>
                    {formattedCurrency(total)}
                  </Text>
                  <Text style={styles.productTotalDescription}>Total</Text>
                </View>
                <TouchableOpacity
                  style={styles.productAddButton}
                  onPress={handleAddItem}
                >
                  <Text style={styles.productAddButtonText}>Add Item</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
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
    padding: 12,
    gap: 8,
  },
  rightContainer: {
    backgroundColor: "#fff",
    width: 380,
    flexShrink: 0,
    padding: 12,
  },
  leftSearchTextInput: {
    borderWidth: 1,
    backgroundColor: "#faf9f9ff",
    borderRadius: 4,
  },
  itemContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderColor: "#ddddddff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  itemLeftSide: {
    flex: 1,
  },
  itemLeftBottomSide: {
    flexDirection: "row",
    gap: 12,
    marginTop: 6,
    alignItems: "center",
  },
  itemRighSide: {
    maxWidth: 200,
    flexShrink: 0,
    justifyContent: "center",
  },
  itemTextHeader: {
    fontWeight: "bold",
    fontSize: 16,
  },
  itemTextDescription: {
    fontSize: 12,
    color: "#868686ff",
  },
  itemSubText: {
    fontSize: 12,
    color: "#868686ff",
  },
  productExclusive: {
    fontSize: 12,
    color: "#5b6fccff",
    fontWeight: "bold",
  },
  productNonExclusive: {
    fontSize: 12,
    color: "#5bcc6eff",
    fontWeight: "bold",
  },
  productRegulated: {
    fontSize: 12,
    color: "#f3492bff",
    fontWeight: "bold",
  },
  productInformationContainerScroll: {
    height: "85%",
    flexDirection: "column",
    gap: 8,
  },
  productInformationContainer: {
    flexDirection: "column",
    gap: 8,
  },
  productInformationBottom: {
    height: "15%",
    flexDirection: "row",
    borderTopWidth: 1,
    borderColor: "#ceccccff",
    padding: 4,
    minHeight: 80,
  },
  productTotal: {
    flex: 1,
    alignItems: "flex-end",
    justifyContent: "center",
    padding: 20,
  },
  productTotalText: {
    fontWeight: "bold",
    fontSize: 24,
  },
  productTotalDescription: {
    fontSize: 14,
  },
  productAddButton: {
    width: "30%",
    backgroundColor: "#015835",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
  },
  productAddButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  inputGroup: {
    flexDirection: "row",
    gap: 12,
  },
  inputContainer: {
    flex: 1,
    marginBottom: 12,
  },
  input: {
    backgroundColor: "#f5f4f4ff",
    borderRadius: 4,
  },
  promoFreeItemContainer: {
    padding: 8,
    borderColor: "#6373ffff",
    borderWidth: 1,
    borderRadius: 4,
  },
});

export default SideModal;
