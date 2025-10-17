import { formattedCurrency } from "@/constants/Currency";
import { useDB } from "@/context/DBProvider";
import { getDB } from "@/OfflineDB/db";
import {
  getCustomerFromLocalDB,
  getSalesListTable,
  getSalesOrder,
} from "@/OfflineDB/dborm";
import { items, salesOrderItems } from "@/OfflineDB/schema";
import {
  CustomersTableType,
  salesOrderTableType,
} from "@/OfflineDB/tableTypes";
import Ionicons from "@expo/vector-icons/Ionicons";
import { eq } from "drizzle-orm";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import SalesListModal from "./Modal/SalesListModal";
import { ProductItemType } from "./Modal/SideModal";

type TableResultType = {
  orderId: number;
  customerName: string;
  dateSold: string;
  status: string;
  total: string;
  dateSynced?: string;
  orderNumber: string;
};

type TableDataType = {
  orderId: number;
  total: number;
  customerId: number;
  customerName: string;
  dateSold: string;
};

type RenderPropType = {
  item: TableResultType;
  index: number;
};

const headers = [
  "Order ID",
  "Customer",
  "Date",
  "Status",
  "Total Sales",
  "Sync Date",
];

const AppTable = () => {
  const [salesOrders, setSalesOrders] = useState<TableResultType[] | null>(
    null
  );
  const [selectedItems, setSelectedItems] = useState<ProductItemType[] | []>(
    []
  );
  const [selectedCustomer, setSelectedCustomer] =
    useState<CustomersTableType | null>(null);
  const [selectedSalesOrder, setSelectedSalesOrder] =
    useState<salesOrderTableType | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(true);
  const [modalSalesPreviewVisible, setModalSalesPreviewVisible] =
    useState(false);

  const db = useDB();

  const handlePreviewModal = () => {
    setModalSalesPreviewVisible(!modalSalesPreviewVisible);
  };

  async function loadSalesOrder() {
    const latestSalesOrder = await getSalesListTable();

    // console.log(latestSalesOrder);

    setSalesOrders(latestSalesOrder);
  }

  const handleShowItem = async (id: number) => {
    const db = await getDB();

    const productData = await db
      .select({
        salesOrderItem: salesOrderItems,
        product: items,
      })
      .from(salesOrderItems)
      .leftJoin(items, eq(salesOrderItems.itemId, items.id))
      .where(eq(salesOrderItems.salesOrderOfflineId, id));

    const salesOrderData = await getSalesOrder(id);

    setSelectedSalesOrder(salesOrderData && salesOrderData[0]);

    setSelectedCustomer(
      await getCustomerFromLocalDB(
        salesOrderData ? salesOrderData[0].customerId ?? 0 : 0
      )
    );

    const cleanedData = productData.map((product) => {
      return {
        product_id: product.product ? product.product.id ?? 0 : 0,
        product: product.product,
        quantity: parseFloat(product.salesOrderItem.quantity),
        promo: product.salesOrderItem.promo,
        discount: product.salesOrderItem.discount
          ? parseFloat(product.salesOrderItem.discount) ?? null
          : null,
        freeItemQuantity: product.salesOrderItem.freeItemQuantity
          ? parseInt(product.salesOrderItem.freeItemQuantity) ?? null
          : null,
        freeItemRemarks: product.salesOrderItem.freeItemRemarks,
        remarks: product.salesOrderItem.remarks,
        total: product.salesOrderItem.total,
      } as ProductItemType;
    });
    setSelectedItems(cleanedData);

    setModalSalesPreviewVisible(true);
  };

  const renderItem = ({ item, index }: RenderPropType) => (
    <View style={styles.tableRow}>
      <Text
        style={[
          styles.tableBodyText,
          index !== (salesOrders ? salesOrders.length - 1 : 0)
            ? styles.tableBorderBottom
            : null,
          { color: "#036810ff" },
        ]}
        onPress={() => {
          handleShowItem(item.orderId);
        }}
      >
        {item.orderNumber}
      </Text>
      <Text
        style={[
          styles.tableBodyText,
          index !== (salesOrders ? salesOrders.length - 1 : 0)
            ? styles.tableBorderBottom
            : null,
        ]}
      >
        {item.customerName}
      </Text>
      <Text
        style={[
          styles.tableBodyText,
          index !== (salesOrders ? salesOrders.length - 1 : 0)
            ? styles.tableBorderBottom
            : null,
        ]}
      >
        {item.dateSold}
      </Text>
      <Text
        style={[
          styles.tableBodyText,
          index !== (salesOrders ? salesOrders.length - 1 : 0)
            ? styles.tableBorderBottom
            : null,
        ]}
      >
        {item.status}
      </Text>
      <Text
        style={[
          styles.tableBodyText,
          index !== (salesOrders ? salesOrders.length - 1 : 0)
            ? styles.tableBorderBottom
            : null,
        ]}
      >
        {formattedCurrency(item.total)}
      </Text>
      <Text
        style={[
          styles.tableBodyText,
          index !== (salesOrders ? salesOrders.length - 1 : 0)
            ? styles.tableBorderBottom
            : null,
        ]}
      >
        {item.dateSynced}
      </Text>
    </View>
  );

  useEffect(() => {
    if (isRefreshing) {
      loadSalesOrder();
      setIsRefreshing(false);
    }
  }, [isRefreshing]);

  return (
    <>
      <SalesListModal
        products={selectedItems}
        customer={selectedCustomer}
        salesId={selectedSalesOrder?.salesOrderNumber ?? ""}
        onClose={handlePreviewModal}
        visible={modalSalesPreviewVisible}
      />
      <View style={[styles.container]}>
        <View>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={24} color="black" />
            <TextInput
              style={styles.searchTextBar}
              placeholder="Search by customer, date or total sold "
            />
          </View>
        </View>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            {headers.map((header, index) => (
              <Text
                key={index}
                style={[
                  styles.tableHeaderText,
                  index !== headers.length - 1 ? styles.tableBorderRight : null,
                ]}
              >
                {header}
              </Text>
            ))}
          </View>
          <View style={styles.tableBody}>
            <FlatList
              data={salesOrders}
              renderItem={renderItem}
              keyExtractor={(item) => item?.orderId.toString()}
              refreshControl={
                <RefreshControl
                  onRefresh={() => setIsRefreshing(true)}
                  refreshing={isRefreshing}
                />
              }
            />
          </View>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 5,
    marginBottom: 50,
  },
  searchContainer: {
    backgroundColor: "#ecececff",
    marginBottom: 12,
    borderRadius: 4,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  searchTextBar: {
    flex: 1,
  },
  table: {
    borderRadius: 5,
  },
  tableHeader: {
    backgroundColor: "#DFDDDD",
    borderTopRightRadius: 5,
    borderTopLeftRadius: 5,
    flexDirection: "row",
    borderBottomWidth: 1,
  },
  tableBorderRight: {
    borderRightWidth: 1,
    borderColor: "#afaeaeff",
  },
  tableBorderBottom: {
    borderBottomWidth: 1,
    borderColor: "#afaeaeff",
  },
  tableHeaderText: {
    flex: 1,
    padding: 10,
    fontWeight: "bold",
    minWidth: 100,
    flexWrap: "wrap",
  },
  tableBody: {
    borderWidth: 1,
    flex: 1,
  },
  tableRow: {
    flexDirection: "row",
  },
  tableBodyText: {
    flex: 1,
    padding: 10,
    minWidth: 100,
    flexWrap: "wrap",
  },
});

export default AppTable;
