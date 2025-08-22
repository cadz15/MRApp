import { CreateSalesOrderType } from "@/app/salesorder/[id]";
import { routes } from "@/constants/Routes";
import { eq, notLike } from "drizzle-orm";
import { getDB } from "./db";
import {
  customers,
  items,
  medrep,
  salesOrderItems,
  salesOrders as salesOrdersSchema,
} from "./schema";
import { getMedRepData } from "./sync";

const generateRandomString = () => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const charactersLength = characters.length;
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

export async function setMedrep(apiKey: string) {
  const db = await getDB();
  const appId = generateRandomString();

  try {
    const res = await fetch(routes.medRep, {
      method: "post",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-API-KEY": `${apiKey}`,
      },
      body: JSON.stringify({ app_key: appId }),
    });

    if (!res.ok) {
      console.warn(`⚠️ API responded with ${res.status} at `);
      return null;
    }

    const medrepData = await res.json();

    if (medrepData?.data) {
      await db
        .insert(medrep)
        .values({
          id: medrepData?.data.id,
          name: medrepData?.data.name,
          apiKey: medrepData?.data.api_key,
          productAppId: medrepData?.data.product_app_id,
          salesOrderAppId: medrepData?.data.sales_order_app_id,
        })
        .onConflictDoUpdate({
          target: medrep.id,
          set: {
            name: medrepData?.data.name,
            apiKey: medrepData?.data.api_key,
            productAppId: medrepData?.data.product_app_id,
            salesOrderAppId: medrepData?.data.sales_order_app_id,
          },
        });

      return true;
    }

    return null;
  } catch (err) {
    console.error(`❌ Failed to fetch :`, err);
    return null;
  }
}

export async function getCustomerFromDB(id: number) {
  const db = await getDB();

  try {
    const result = await db
      .select()
      .from(customers)
      .where(eq(customers.id, id));

    return result;
  } catch (err) {
    console.error(`❌ Failed to fetch :`, err);
    return null;
  }
}

export async function getItemsFromDB(withS3: boolean) {
  const db = await getDB();

  try {
    if (withS3) {
      const result = await db.select().from(items);

      return result;
    } else {
      const result = await db
        .select()
        .from(items)
        .where(notLike(items.productType, "regulated"));
      return result;
    }
  } catch (err) {
    console.error(`❌ Failed to fetch :`, err);
    return null;
  }
}

export async function setSalesOrder(salesOrder: CreateSalesOrderType) {
  const db = await getDB();
  const medrep = await getMedRepData();

  try {
    const so = await db.insert(salesOrdersSchema).values({
      customerId: salesOrder.customerId,
      customerOnlineId: salesOrder.customerOnlineId,
      medicalRepresentativeId: medrep[0]?.id,
      salesOrderNumber: salesOrder.salesOrderNumber,
      dateSold: salesOrder.dateSold,
      total: salesOrder.total,
      remarks: salesOrder.remarks,
      syncDate: "",
      status: "pending",
    });

    for (const salesOrderItem of salesOrder?.items) {
      await db.insert(salesOrderItems).values({
        salesOrderId: 0,
        salesOrderOfflineId: so.lastInsertRowId,
        itemId: salesOrderItem.product_id,
        quantity: salesOrderItem.quantity.toString(),
        promo: salesOrderItem.promo,
        discount: salesOrderItem.discount?.toString(),
        freeItemQuantity: salesOrderItem.freeItemQuantity?.toString(),
        freeItemRemarks: salesOrderItem.freeItemRemarks,
        remarks: salesOrderItem.remarks,
        total: salesOrderItem.total,
      });
    }

    return true;
  } catch (error) {
    console.error(`❌ Failed to fetch :`, error);
    return null;
  }
}

export async function getCustomerFromLocalDB(id: number) {
  const db = await getDB();

  try {
    const result = await db
      .select()
      .from(customers)
      .where(eq(customers.onlineId, id));

    return result[0];
  } catch (err) {
    console.error(`❌ Failed to fetch :`, err);
    return null;
  }
}

export async function getSalesListTable() {
  const db = await getDB();

  try {
    const result = await db
      .select()
      .from(salesOrdersSchema)
      .innerJoin(customers, eq(salesOrdersSchema.customerId, customers.id))
      .orderBy(salesOrdersSchema.dateSold);

    if (result) {
      const data = result.map((r) => {
        return {
          orderId: r.sales_orders.id,
          customerName: r.customers.name,
          dateSold: r.sales_orders.dateSold,
          status: r.sales_orders.status,
          total: r.sales_orders.total,
        };
      });

      return data;
    }

    return null;
  } catch (err) {
    console.error(`❌ Failed to fetch :`, err);
    return null;
  }
}
