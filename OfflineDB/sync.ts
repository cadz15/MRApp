import { getDB } from "./db";
import { customers, items } from "./schema";

// Replace with your Laravel API endpoint
const API_BASE = "https://your-laravel-api.com/api";

export async function syncCustomers() {
  const db = await getDB();

  // Fetch remote customers
  const res = await fetch(`${API_BASE}/customers`);
  const remoteCustomers = await res.json();

  // Insert/update local DB
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
}

export async function syncItems() {
  const db = await getDB();

  const res = await fetch(`${API_BASE}/items`);
  const remoteItems = await res.json();

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
}
