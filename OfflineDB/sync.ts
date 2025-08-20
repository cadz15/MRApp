import { routes } from "@/constants/Routes";
import { eq, inArray } from "drizzle-orm";
import { getDB } from "./db";
import {
  customers,
  items,
  medrep,
  salesOrderItems,
  salesOrders,
} from "./schema";

const API_BASE = process.env.EXPO_PUBLIC_API_LINK;

/**
 * Safe fetch helper that catches API/network errors
 */
async function safeFetch(url: string, type = "get") {
  const db = await getDB();
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

  const remoteCustomers = await safeFetch(`${routes.customers}`);
  if (!remoteCustomers) {
    console.log("⚠️ Skipping customers sync (API unreachable)");
    return;
  }

  for (const cust of remoteCustomers) {
    await db
      .insert(customers)
      .values({
        id: cust.id,
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
        syncDate: cust.sync_date,
      })
      .onConflictDoUpdate({
        target: customers.id,
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
          syncDate: cust.sync_date,
        },
      });
  }

  console.log(`✅ Synced ${remoteCustomers.length} customers`);
}

export async function syncItems() {
  const db = await getDB();

  const remoteItems = await safeFetch(`${routes.items}`);
  if (!remoteItems) {
    console.log("⚠️ Skipping items sync (API unreachable)");
    return;
  }

  for (const item of remoteItems) {
    await db
      .insert(items)
      .values({
        id: item.id,
        brandName: item.brand_name,
        genericName: item.generic_name,
        milligrams: item.milligrams,
        supply: item.supply,
        catalogPrice: item.catalog_price,
        productType: item.product_type,
        inventory: item.inventory,
      })
      .onConflictDoUpdate({
        target: items.id,
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
  }

  console.log(`✅ Synced ${remoteItems.length} items`);
}

export async function syncSalesOrder() {
  const db = await getDB();

  const remoteSalesOrders = await safeFetch(routes.salesorder);
  if (!remoteSalesOrders) {
    console.log("⚠️ Skipping items sync (API unreachable)");
    return;
  }

  for (const salesOrder of remoteSalesOrders) {
    await db
      .insert(salesOrders)
      .values({
        id: salesOrder.id,
        customerId: salesOrder.customer_id,
        medicalRepresentativeId: salesOrder.medical_representative_id,
        salesOrderNumber: salesOrder.sales_order_number,
        dateSold: salesOrder.date_sold,
        total: salesOrder.total,
        remarks: salesOrder.remarks,
        syncDate: salesOrder.sync_date,
        status: salesOrder.status,
      })
      .onConflictDoUpdate({
        target: salesOrders.id,
        set: {
          customerId: salesOrder.customer_id,
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
      await db
        .insert(salesOrderItems)
        .values({
          id: salesOrderItem.id,
          salesOrderId: salesOrderItem.sales_order_id,
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
          target: salesOrderItems.id,
          set: {
            salesOrderId: salesOrderItem.sales_order_id,
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
    }
  }

  console.log(`✅ Synced ${remoteSalesOrders.length} items`);
}

export async function syncLocalSalesOrders() {
  const db = await getDB();
  const nowDate = new Date().toLocaleDateString();

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
  const orderIds = unsyncedOrders.map((o) => o.id);

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

  // Step 5: Sync each order with its items
  for (const order of unsyncedOrders) {
    const payload = {
      ...order,
      items: itemsByOrder[order.id] ?? [],
    };

    try {
      const res = await fetch(routes.salesCreate, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        await db
          .update(salesOrders)
          .set({ syncDate: `${nowDate}` })
          .where(eq(salesOrders.id, order.id));

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
      id: cust.id,
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

    try {
      const res = await fetch(routes.customersCreate, {
        method: "POST", // or PUT if updating
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        // 3. Mark as synced
        await db
          .update(customers)
          .set({ syncDate: nowDate })
          .where(eq(customers.id, cust.id));

        console.log(`✅ Customer ${cust.id} synced`);
      } else {
        console.warn(`⚠️ Failed to sync customer ${cust.id} (${res.status})`);
      }
    } catch (err) {
      console.error(`❌ Sync error for customer ${cust.id}:`, err);
    }
  }
}

export async function getMedRepData() {
  const db = await getDB();

  const result = await db.select().from(medrep);

  console.log(result);

  return result;
}

export async function syncDownData() {
  try {
    syncCustomers();
    syncItems();
    syncSalesOrder();
  } catch (error) {}
}

export async function syncUpData() {
  try {
    await syncLocalCustomers();
    await syncLocalSalesOrders();
  } catch (error) {}
}
