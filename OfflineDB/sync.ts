import { routes } from "@/constants/Routes";
import axios from "axios";
import { eq, inArray } from "drizzle-orm";
import { getDB } from "./db";
import { getCustomerFromLocalDB, setCustomer } from "./dborm";
import {
  customers,
  items,
  medrep,
  salesOrderItems,
  salesOrders,
} from "./schema";
import { CustomersTableType } from "./tableTypes";

const API_BASE = process.env.EXPO_PUBLIC_API_LINK;

async function safeAxios(url: string, type = "get") {
  const medRepData = await getMedRepData();

  try {
    const response = await axios({
      method: type,
      url: url,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-API-KEY": `${medRepData[0]?.apiKey}`,
        "X-API-APP-KEY": `${medRepData[0]?.salesOrderAppId}`,
      },
    });

    return response.data; // Axios automatically parses the response body as JSON
  } catch (err) {
    console.error(`❌ Failed to fetch ${url}:`, err);
    return null;
  }
}

/**
 * Safe fetch helper that catches API/network errors
 */
async function safeFetch(url: string, type = "get") {
  const medRepData = await getMedRepData();

  try {
    const res = await fetch(url, {
      method: type,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-API-KEY": `${medRepData[0]?.apiKey}`,
        "X-API-APP-KEY": `${medRepData[0]?.salesOrderAppId}`,
      },
    });

    if (!res.ok) {
      console.warn(`⚠️ API responded with ${res.status} at ${url}`);
      return null;
    }

    return await res.json();
  } catch (err) {
    console.error(`❌ Failed to fetch ${url}:`, err);
    return null;
  }
}

export async function syncCustomers() {
  const db = await getDB();

  const remoteCustomers = await safeAxios(`${routes.customers}`);
  if (!remoteCustomers) {
    console.log("⚠️ Skipping customers sync (API unreachable)");
    return;
  }

  for (const cust of remoteCustomers?.data) {
    try {
      await db
        .insert(customers)
        .values({
          onlineId: cust.id,
          name: cust.name,
          fullAddress: cust.full_address,
          shortAddress: cust.short_address,
          region: cust.region,
          class: cust.class,
          practice: cust.practice,
          s3License: cust.s3_license,
          s3Validity: cust.s3_validity,
          pharmacistName: cust.pharmacist_name,
          prcId: cust.prc_id,
          prcValidity: cust.prc_validity,
          remarks: cust.remarks,
          syncDate: cust.sync_date ?? new Date().toLocaleDateString(),
        })
        .onConflictDoUpdate({
          target: customers.onlineId,
          set: {
            name: cust.name,
            fullAddress: cust.full_address,
            shortAddress: cust.short_address,
            region: cust.region,
            class: cust.class,
            practice: cust.practice,
            s3License: cust.s3_license,
            s3Validity: cust.s3_validity,
            pharmacistName: cust.pharmacist_name,
            prcId: cust.prc_id,
            prcValidity: cust.prc_validity,
            remarks: cust.remarks,
            syncDate: cust.sync_date ?? new Date().toLocaleDateString(),
          },
        });
    } catch (error) {
      console.error(`❌ Sync error for customer ID ${cust.id}:`, error);
    }
  }

  console.log(`✅ Synced ${remoteCustomers?.data.length} customers`);
}

export async function syncItems() {
  const db = await getDB();

  const remoteItems = await safeAxios(`${routes.items}`);
  if (!remoteItems) {
    console.log("⚠️ Skipping items sync (API unreachable)");
    return;
  }

  for (const item of remoteItems?.data) {
    try {
      await db
        .insert(items)
        .values({
          onlineId: item.id,
          brandName: item.brand_name,
          genericName: item.generic_name,
          milligrams: item.milligrams,
          supply: item.supply,
          catalogPrice: item.catalog_price,
          productType: item.product_type,
          inventory: item.inventory,
        })
        .onConflictDoUpdate({
          target: items.onlineId,
          set: {
            brandName: item.brand_name,
            genericName: item.generic_name,
            milligrams: item.milligrams,
            supply: item.supply,
            catalogPrice: item.catalog_price,
            productType: item.product_type,
            inventory: item.inventory,
          },
        });
    } catch (error) {
      console.error(`❌ Sync error for items:`, error);
    }
  }

  console.log(`✅ Synced ${remoteItems?.data.length} items`);
}

export async function syncSalesOrder() {
  const db = await getDB();

  const remoteSalesOrders = await safeAxios(routes.salesorder);
  if (!remoteSalesOrders) {
    console.log("⚠️ Skipping items sync (API unreachable)");
    return;
  }

  for (const salesOrder of remoteSalesOrders?.data) {
    const selectedCustomerData = await getCustomerFromLocalDB(
      salesOrder.customer_id
    );

    const offlineSaleOrder = await db
      .insert(salesOrders)
      .values({
        onlineId: salesOrder.id,
        customerId: selectedCustomerData?.id,
        customerOnlineId: salesOrder.customer_id,
        medicalRepresentativeId: salesOrder.medical_representative_id,
        salesOrderNumber: salesOrder.sales_order_number,
        dateSold: salesOrder.date_sold,
        total: salesOrder.total,
        remarks: salesOrder.remarks,
        syncDate: salesOrder.sync_date,
        status: salesOrder.status,
      })
      .onConflictDoUpdate({
        target: salesOrders.onlineId,
        set: {
          customerId: selectedCustomerData?.id,
          customerOnlineId: salesOrder.customer_id,
          medicalRepresentativeId: salesOrder.medical_representative_id,
          salesOrderNumber: salesOrder.sales_order_number,
          dateSold: salesOrder.date_sold,
          total: salesOrder.total,
          remarks: salesOrder.remarks,
          syncDate: salesOrder.sync_date,
          status: salesOrder.status,
        },
      });

    for (const salesOrderItem of salesOrder.sales_order_items) {
      try {
        await db
          .insert(salesOrderItems)
          .values({
            onlineId: salesOrderItem.id,
            salesOrderId: salesOrderItem.sales_order_id,
            salesOrderOfflineId: offlineSaleOrder.lastInsertRowId,
            itemId: salesOrder.item_id,
            quantity: salesOrderItem.quantity,
            promo: salesOrderItem.promo,
            discount: salesOrderItem.discount,
            freeItemQuantity: salesOrderItem.free_item_quantity,
            freeItemRemarks: salesOrderItem.free_item_remarks,
            remarks: salesOrderItem.remarks,
            total: salesOrderItem.total,
          })
          .onConflictDoUpdate({
            target: salesOrderItems.onlineId,
            set: {
              salesOrderId: salesOrderItem.sales_order_id,
              salesOrderOfflineId: offlineSaleOrder.lastInsertRowId,
              itemId: salesOrder.item_id,
              quantity: salesOrderItem.quantity,
              promo: salesOrderItem.promo,
              discount: salesOrderItem.discount,
              freeItemQuantity: salesOrderItem.free_item_quantity,
              freeItemRemarks: salesOrderItem.free_item_remarks,
              remarks: salesOrderItem.remarks,
              total: salesOrderItem.total,
            },
          });
      } catch (error) {
        console.error(`❌ Sync error for items:`, error);
      }
    }
  }

  console.log(`✅ Synced ${remoteSalesOrders?.data.length} sales orders`);
}

export async function syncLocalSalesOrders() {
  const db = await getDB();
  const nowDate = new Date().toLocaleDateString();
  const medRepData = await getMedRepData();

  // Step 1: Get unsynced orders
  const unsyncedOrders = await db
    .select()
    .from(salesOrders)
    .where(eq(salesOrders.syncDate, ""));

  if (unsyncedOrders.length === 0) {
    console.log("✅ No local sales orders to sync");
    return;
  }

  // Step 2: Collect IDs
  const orderIds = unsyncedOrders.map((o) => (o.onlineId ? o.onlineId : 0));

  // Step 3: Get items for these orders
  const items = await db
    .select()
    .from(salesOrderItems)
    .where(inArray(salesOrderItems.salesOrderId, orderIds));

  // Step 4: Group items by orderId
  const itemsByOrder: Record<number, typeof items> = {};
  for (const item of items) {
    if (!itemsByOrder[item.salesOrderId]) {
      itemsByOrder[item.salesOrderId] = [];
    }
    itemsByOrder[item.salesOrderId].push(item);
  }

  console.log("Unsynced Orders: ", unsyncedOrders);
  console.log("orders items: ", items);
  console.log("Items by Orders: ", itemsByOrder);

  // Step 5: Sync each order with its items
  for (const order of unsyncedOrders) {
    const items = itemsByOrder[0];
    const payload = {
      ...order,
      items: items.filter((item) => item.salesOrderOfflineId === order.id),
    };

    console.log(medRepData[0]?.apiKey, medRepData[0]?.salesOrderAppId);

    try {
      const res = await axios(routes.salesCreate, {
        method: "post",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "X-API-KEY": `${medRepData[0]?.apiKey}`,
          "X-API-APP-KEY": `${medRepData[0]?.salesOrderAppId}`,
        },
        data: JSON.stringify(payload),
      });

      if (res.status === 200) {
        const data = res.data;
        console.log(res.data);

        await db
          .update(salesOrders)
          .set({
            syncDate: `${nowDate}`,
            onlineId: data.salesOrderId,
          })
          .where(eq(salesOrders.id, order.id));

        data.salesItemIds.forEach(async (item: { key: number }) => {
          const [key, value] = Object.entries(item)[0]; // Get the first key-value pair
          if (value) {
            await db
              .update(salesOrderItems)
              .set({ onlineId: value })
              .where(eq(salesOrderItems.id, parseInt(key)));
          }
        });
        console.log(`✅ Sales order ${order.id} synced with items`);
      } else {
        console.warn(`⚠️ Failed to sync order ${order.id} (${res.status})`);
      }
    } catch (err) {
      console.error(`❌ Sync error for order ${order.id}:`, err);
    }
  }
}

export async function syncLocalCustomers() {
  const db = await getDB();
  const nowDate = new Date().toLocaleDateString();
  const medRepData = await getMedRepData();

  // 1. Get unsynced customers
  const unsyncedCustomers = await db
    .select()
    .from(customers)
    .where(eq(customers.syncDate, ""));

  if (unsyncedCustomers.length === 0) {
    console.log("✅ No local customers to sync");
    return;
  }

  // 2. Send each unsynced customer to API
  for (const cust of unsyncedCustomers) {
    const payload = {
      id: cust.onlineId,
      name: cust.name,
      full_address: cust.fullAddress,
      short_address: cust.shortAddress,
      region: cust.region,
      class: cust.class,
      practice: cust.practice,
      s3_license: cust.s3License,
      s3_validity: cust.s3Validity,
      pharmacist_name: cust.pharmacistName,
      prc_id: cust.prcId,
      prc_validity: cust.prcValidity,
      remarks: cust.remarks,
      sync_date: cust.syncDate,
    };

    console.log("Sync Customer Payload: ", JSON.stringify(payload));

    try {
      const res = await axios(routes.customersCreate, {
        method: "POST", // or PUT if updating
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "X-API-KEY": `${medRepData[0]?.apiKey}`,
          "X-API-APP-KEY": `${medRepData[0]?.salesOrderAppId}`,
        },
        data: JSON.stringify(payload),
      });

      if (res.status === 200) {
        // 3. Mark as synced
        const data = await res.data;

        // update customers table
        await db
          .update(customers)
          .set({ syncDate: nowDate, onlineId: data.customer_id })
          .where(eq(customers.id, cust.id));

        // update all sales order with customer id
        await db
          .update(salesOrders)
          .set({ customerOnlineId: data.customer_id })
          .where(eq(salesOrders.customerId, cust.id));

        console.log(`✅ Customer ${cust.id} synced`);
      } else {
        console.warn(`⚠️ Failed to sync customer ${cust.id} (${res.status})`);
      }
    } catch (err) {
      console.error(`❌ Sync error for customer ${cust.id}:`, err);
    }
  }
}

export async function uploadCustomer(data: CustomersTableType) {
  try {
    const medRepData = await getMedRepData();

    const result = axios(routes.customersCreate, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-API-KEY": `${medRepData[0]?.apiKey}`,
        "X-API-APP-KEY": `${medRepData[0]?.salesOrderAppId}`,
      },
      data: JSON.stringify(data),
    });

    if ((await result).status === 200) {
      const id = (await result).data.id;
      const localCustomer = await setCustomer(data, id);

      return localCustomer;
    } else {
      await setCustomer(data);
      return false;
    }
  } catch (error) {
    console.error(`❌ Sync error`, error);
    await setCustomer(data);
  }

  return false;
}

export async function getMedRepData() {
  const db = await getDB();

  const result = await db.select().from(medrep);

  return result;
}

export async function syncDownData() {
  try {
    syncCustomers();
    syncItems();
    syncSalesOrder();
  } catch (error) {
    console.error(`❌ Sync error`, error);
  }
}

export async function syncUpData() {
  try {
    await syncLocalCustomers();
    await syncLocalSalesOrders();
  } catch (error) {}
}
