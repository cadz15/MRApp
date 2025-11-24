import { routes } from "@/constants/Routes";
import { getNowDate } from "@/utils/currentDate";
import axios from "axios";
import { eq, inArray } from "drizzle-orm";
import { getDB } from "./db";
import { getCustomerFromLocalDB, setCustomer, setDcr } from "./dborm";
import {
  customers,
  dailyCallRecords,
  items,
  medrep,
  salesOrderItems,
  salesOrders,
} from "./schema";
import { CustomersTableType, dcrTableType } from "./tableTypes";

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

export async function getAnalytics() {
  try {
    const res = await safeAxios(`${routes.analytics}`);

    if (!res) {
      console.log("⚠️ Skipping items sync (API unreachable)");
      return 401;
    }

    return res;
  } catch (error) {
    console.log(error);

    return 500;
  }
}

export async function checkMedRep() {
  try {
    const res = await safeAxios(`${routes.salesorder}`);

    if (!res) {
      return 401; //if not authenticated
    }

    return 200; //authenticated
  } catch (error) {
    return 500; //server error
  }
}

export async function syncCustomers() {
  const db = await getDB();

  const remoteCustomers = await safeAxios(`${routes.customers}`);
  if (!remoteCustomers) {
    console.log("⚠️ Skipping customers sync (API unreachable)");
    return "error";
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
          createdAt: cust.created_at,
          updatedAt: cust.updated_at,
          deletedAt: cust.deleted_at ?? "",
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
            createdAt: cust.created_at,
            updatedAt: cust.updated_at,
            deletedAt: cust.deleted_at ?? "",
          },
        });
    } catch (error) {
      console.error(`❌ Sync error for customer ID ${cust.id}:`, error);
      return "error";
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
          createdAt: item.created_at,
          updatedAt: item.updated_at,
          deletedAt: item.deleted_at ?? "",
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
            createdAt: item.created_at,
            updatedAt: item.updated_at,
            deletedAt: item.deleted_at ?? "",
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

  const remoteSalesOrders = await safeAxios(`${routes.salesorder}`, "get");
  if (!remoteSalesOrders) {
    console.log("⚠️ Skipping items sync (API unreachable)");
    return;
  }

  for (const salesOrder of remoteSalesOrders?.data) {
    const selectedCustomerData = await getCustomerFromLocalDB(
      salesOrder.customer?.id
    );

    try {
      const offlineSaleOrder = await db
        .insert(salesOrders)
        .values({
          onlineId: salesOrder.id,
          customerId: selectedCustomerData?.id ?? null,
          customerOnlineId: salesOrder.customer?.id,
          medicalRepresentativeId: salesOrder.medical_representative.id,
          salesOrderNumber: salesOrder.sales_order_number,
          dateSold: salesOrder.date_sold,
          total: salesOrder.total,
          remarks: salesOrder.remarks,
          syncDate:
            salesOrder.sync_date && salesOrder.syncDate !== ""
              ? salesOrder.sync_date
              : getNowDate(),
          status: salesOrder.status,
          createdAt: salesOrder.created_at,
          updatedAt: salesOrder.updated_at,
          deletedAt: salesOrder.deleted_at ?? "",
        })
        .onConflictDoUpdate({
          target: salesOrders.onlineId,
          set: {
            customerId: selectedCustomerData?.id ?? null,
            customerOnlineId: salesOrder.customer?.id,
            medicalRepresentativeId: salesOrder.medical_representative_id,
            salesOrderNumber: salesOrder.sales_order_number,
            dateSold: salesOrder.date_sold,
            total: salesOrder.total,
            remarks: salesOrder.remarks,
            syncDate: salesOrder.sync_date ?? getNowDate(),
            status: salesOrder.status,
            createdAt: salesOrder.created_at,
            updatedAt: salesOrder.updated_at,
            deletedAt: salesOrder.deleted_at ?? "",
          },
        })
        .returning();

      for (const salesOrderItem of salesOrder.sales_order_items) {
        try {
          //get local product item
          const productItem = await db
            .select()
            .from(items)
            .where(eq(items.onlineId, salesOrderItem.item_id));

          //insert sales order item
          const item = await db
            .insert(salesOrderItems)
            .values({
              onlineId: salesOrderItem.id,
              salesOrderId: salesOrderItem.sales_order_id,
              salesOrderOfflineId: offlineSaleOrder[0]?.id,
              itemId: productItem[0]?.id,
              itemOnlineId: salesOrderItem.item_id,
              quantity: salesOrderItem.quantity,
              promo: salesOrderItem.promo,
              discount: salesOrderItem.discount,
              freeItemQuantity: salesOrderItem.free_item_quantity,
              freeItemRemarks: salesOrderItem.free_item_remarks,
              remarks: salesOrderItem.remarks,
              total: salesOrderItem.total,
              createdAt: salesOrderItem.created_at,
              updatedAt: salesOrderItem.updated_at,
              deletedAt: salesOrderItem.deleted_at ?? "",
            })
            .onConflictDoUpdate({
              target: salesOrderItems.onlineId,
              set: {
                salesOrderId: salesOrderItem.sales_order_id,
                salesOrderOfflineId: offlineSaleOrder[0]?.id,
                itemId: productItem[0]?.id,
                itemOnlineId: salesOrderItem.item_id,
                quantity: salesOrderItem.quantity,
                promo: salesOrderItem.promo,
                discount: salesOrderItem.discount,
                freeItemQuantity: salesOrderItem.free_item_quantity,
                freeItemRemarks: salesOrderItem.free_item_remarks,
                remarks: salesOrderItem.remarks,
                total: salesOrderItem.total,
                createdAt: salesOrderItem.created_at,
                updatedAt: salesOrderItem.updated_at,
                deletedAt: salesOrderItem.deleted_at ?? "",
              },
            })
            .returning();

          console.log(
            `Sales Order Item: ${item[0]?.id} - Sales Order: ${offlineSaleOrder[0]?.id}`
          );
        } catch (error) {
          console.error(`❌ Sync error for items:`, error);
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  console.log(`✅ Synced ${remoteSalesOrders?.data.length} sales orders`);
}

export async function syncDcr() {
  const db = await getDB();

  const remoteDcrData = await safeAxios(`${routes.dcrData}`, "get");
  if (!remoteDcrData) {
    console.log("⚠️ Skipping items sync (API unreachable)");
    return;
  }

  for (const dcrData of remoteDcrData?.data) {
    const selectedCustomerData = await getCustomerFromLocalDB(
      dcrData.customer_id
    );

    try {
      await db
        .insert(dailyCallRecords)
        .values({
          onlineId: dcrData.id,
          customerId: selectedCustomerData?.id ?? null,
          customerOnlineId: dcrData.customer_id,
          name: selectedCustomerData?.name ?? "",
          practice:
            selectedCustomerData?.practice ?? selectedCustomerData?.fullAddress,
          signature: dcrData.signature,
          remarks: dcrData.remarks,
          dcrDate: dcrData.dcr_date,
          syncDate: dcrData.sync_date ?? getNowDate(),
          createdAt: dcrData.created_at,
          updatedAt: dcrData.updated_at,
          deletedAt: dcrData.deleted_at ?? "",
        })
        .onConflictDoUpdate({
          target: dailyCallRecords.onlineId,
          set: {
            customerId: selectedCustomerData?.id ?? null,
            customerOnlineId: dcrData.customer_id,
            name: selectedCustomerData?.name ?? "",
            practice:
              selectedCustomerData?.practice ??
              selectedCustomerData?.fullAddress,
            signature: dcrData.signature,
            remarks: dcrData.remarks,
            dcrDate: dcrData.dcr_date,
            syncDate: dcrData.sync_date ?? getNowDate(),
            createdAt: dcrData.created_at,
            updatedAt: dcrData.updated_at,
            deletedAt: dcrData.deleted_at ?? "",
          },
        })
        .returning();
    } catch (error) {
      console.error(`❌ Sync error for dcr:`, error);
    }
  }

  console.log(`✅ Synced ${remoteDcrData?.data.length} dcr data`);
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

  // console.log("unsynced orders: ", unsyncedOrders);

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

  // console.info("Items Data:", items);

  // Step 4: Group items by orderId
  const itemsByOrder: Record<number, typeof items> = {};
  for (const item of items) {
    if (!itemsByOrder[item.salesOrderOfflineId]) {
      itemsByOrder[item.salesOrderOfflineId] = [];
    }
    itemsByOrder[item.salesOrderOfflineId].push(item);
  }

  // console.log("Unsynced Orders: ", unsyncedOrders);
  // console.log("orders items: ", items);
  // console.log("Items by Orders: ", itemsByOrder);

  // Step 5: Sync each order with its items
  for (const order of unsyncedOrders) {
    const items = itemsByOrder[order.id];

    // console.log(`Order`, order);
    // console.log(`Items By Order [${order.id}]`, itemsByOrder);

    const payload = {
      ...order,
      items: items.filter((item) => item.salesOrderOfflineId === order.id),
    };

    // console.log("sync online:", payload);

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

export async function syncLocalDcrs() {
  const db = await getDB();
  const nowDate = new Date().toLocaleDateString();
  const medRepData = await getMedRepData();

  // 1. Get unsynced customers
  const unsyncedDcr = await db
    .select()
    .from(dailyCallRecords)
    .where(eq(dailyCallRecords.syncDate, ""));

  console.log(unsyncedDcr);

  if (unsyncedDcr.length === 0) {
    console.log("✅ No local dcrs to sync");
    return;
  }

  // 2. Send each unsynced customer to API
  for (const dcr of unsyncedDcr) {
    const payload = {
      id: dcr.onlineId,
      customer_id: dcr.customerOnlineId,
      name: dcr.name,
      dcr_date: dcr.dcrDate,
      remarks: dcr.remarks,
      sync_date: dcr.syncDate,
    };

    console.log("Sync DCR Payload: ", JSON.stringify(payload));

    try {
      const res = await axios(routes.dcrCreate, {
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
          .update(dailyCallRecords)
          .set({ syncDate: nowDate, onlineId: data.id })
          .where(eq(dailyCallRecords.id, dcr.id));

        console.log(`✅ DCR #${dcr.id} synced`);
      } else {
        console.warn(`⚠️ Failed to sync customer ${dcr.id} (${res.status})`);
      }
    } catch (err) {
      console.error(`❌ Sync error for customer ${dcr.id}:`, err);
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

export async function uploadDcr(data: dcrTableType) {
  try {
    const medRepData = await getMedRepData();

    const result = axios(routes.dcrCreate, {
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
      const localCustomer = await setDcr(data, id);

      return localCustomer;
    } else {
      await setDcr(data);
      return false;
    }
  } catch (error) {
    console.error(`❌ Sync error`, error.response.data);
    await setDcr(data);
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
    await syncCustomers();
    await syncItems();
    await syncDcr();
    return await syncSalesOrder();
  } catch (error) {
    console.error(`❌ Sync error`, error);
  }

  return true;
}

export async function syncUpData() {
  try {
    await syncLocalCustomers();
    await syncLocalSalesOrders();
    await syncLocalDcrs();
  } catch (error) {}
}
