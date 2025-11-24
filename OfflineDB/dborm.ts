import { CreateSalesOrderType } from "@/app/salesorder/[id]";
import { routes } from "@/constants/Routes";
import axios from "axios";
import { and, desc, eq, notLike, sql } from "drizzle-orm";
import { getDB } from "./db";
import {
  customers,
  dailyCallRecords,
  items,
  medrep as MedRepSchema,
  salesOrderItems,
  salesOrders as salesOrdersSchema,
} from "./schema";
import { getMedRepData } from "./sync";
import {
  CustomersTableType,
  dcrTableType,
  salesOrderItemTableType,
  salesOrderTableType,
} from "./tableTypes";

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
    const res = await axios(routes.medRep, {
      method: "post",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-API-KEY": `${apiKey}`,
      },
      data: JSON.stringify({ app_key: appId }),
    });

    if (res.status !== 200) {
      console.warn(`⚠️ API responded with ${res.status} at `);
      return null;
    }

    const medrepData = await res.data;

    if (medrepData?.data) {
      await db
        .insert(MedRepSchema)
        .values({
          id: 1,
          onlineId: medrepData?.data.id,
          name: medrepData?.data.name,
          apiKey: medrepData?.data.api_key,
          productAppId: medrepData?.data.product_app_id,
          salesOrderAppId: medrepData?.data.sales_order_app_id,
        })
        .onConflictDoUpdate({
          target: MedRepSchema.id,
          set: {
            onlineId: medrepData?.data.id,
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
      .where(and(eq(customers.id, id), eq(customers.deletedAt, "")));

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
      const result = await db
        .select()
        .from(items)
        .where(eq(items.deletedAt, ""));

      return result;
    } else {
      const result = await db
        .select()
        .from(items)
        .where(
          and(notLike(items.productType, "regulated"), eq(items.deletedAt, ""))
        );
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
    const salesOrderInsert: salesOrderTableType = {
      onlineId: null,
      customerId: salesOrder.customerId,
      customerOnlineId: salesOrder.customerOnlineId ?? null,
      medicalRepresentativeId: medrep[0]?.id,
      salesOrderNumber: salesOrder.salesOrderNumber,
      dateSold: salesOrder.dateSold,
      total: salesOrder.total,
      remarks: salesOrder.remarks ?? null,
      syncDate: "",
      status: "pending",
      deletedAt: "",
    };
    const so = await db.insert(salesOrdersSchema).values(salesOrderInsert);

    for (const salesOrderItem of salesOrder?.items) {
      console.info("Insert Sales Item :", salesOrderItem);

      const salesItemInsert: salesOrderItemTableType = {
        salesOrderId: 0,
        salesOrderOfflineId: so.lastInsertRowId,
        itemId: salesOrderItem.product_id,
        itemOnlineId: salesOrderItem.product?.onlineId,
        quantity: salesOrderItem.quantity.toString(),
        promo: salesOrderItem.promo,
        discount: salesOrderItem.discount?.toString() ?? null,
        freeItemQuantity: salesOrderItem.freeItemQuantity?.toString() ?? null,
        freeItemRemarks: salesOrderItem.freeItemRemarks ?? null,
        remarks: salesOrderItem.remarks ?? null,
        total: salesOrderItem.total,
        deletedAt: "",
      };

      console.log("inserted Item:", salesItemInsert);

      await db.insert(salesOrderItems).values(salesItemInsert);
    }

    return true;
  } catch (error) {
    console.error(`❌ Failed to fetch :`, error);
    return null;
  }
}

export async function getSalesOrder(id: number) {
  const db = await getDB();
  const medrep = await getMedRepData();

  try {
    return await db
      .select()
      .from(salesOrdersSchema)
      .where(eq(salesOrdersSchema.id, id));
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
      .where(and(eq(customers.onlineId, id), eq(customers.deletedAt, "")));

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
      .where(eq(salesOrdersSchema.deletedAt, ""))
      .innerJoin(customers, eq(salesOrdersSchema.customerId, customers.id))
      .orderBy(desc(salesOrdersSchema.salesOrderNumber));

    if (result) {
      const data = result.map((r) => {
        return {
          orderNumber: r.sales_orders.salesOrderNumber,
          orderId: r.sales_orders.id,
          customerName: r.customers.name,
          dateSold: r.sales_orders.dateSold,
          status: r.sales_orders.status,
          total: r.sales_orders.total,
          dateSynced: r.sales_orders.syncDate,
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

export async function getDcrTable() {
  const db = await getDB();

  try {
    const result = await db
      .select()
      .from(dailyCallRecords)
      .orderBy(
        desc(
          sql`
        date(
          -- Day
          substr(${dailyCallRecords.dcrDate},
            instr(${dailyCallRecords.dcrDate}, ' ') + 1,
            instr(${dailyCallRecords.dcrDate}, ',') - instr(${dailyCallRecords.dcrDate}, ' ') - 1
          )
          || ' ' ||
          -- Month (remove period if exists)
          replace(
            substr(${dailyCallRecords.dcrDate}, 1, instr(${dailyCallRecords.dcrDate}, '.') - 1),
            '.',
            ''
          )
          || ' ' ||
          -- Year
          substr(${dailyCallRecords.dcrDate}, -4)
        )
      `
        )
      );

    if (result) {
      const data = result.map((r) => {
        return r;
      });

      return data;
    }

    return null;
  } catch (err) {
    console.error(`❌ Failed to fetch :`, err);
    return null;
  }
}

export async function setCustomer(data: CustomersTableType, onlineId = null) {
  try {
    const db = await getDB();

    await db.insert(customers).values({
      class: data.class,
      fullAddress: data.fullAddress,
      name: data.name,
      region: data.region,
      shortAddress: data.shortAddress,
      pharmacistName: data.pharmacistName,
      onlineId: onlineId,
      practice: data.practice,
      prcId: data.prcId,
      prcValidity: data.prcValidity,
      remarks: data.remarks,
      s3License: data.s3License,
      s3Validity: data.s3Validity,
      syncDate: onlineId ? new Date().toLocaleDateString() : "",
      deletedAt: "",
    });

    return true;
  } catch (err) {
    console.error(`❌ Failed to create customer :`, err);
    return false;
  }
}

export async function setDcr(data: dcrTableType, onlineId = null) {
  try {
    const db = await getDB();

    await db.insert(dailyCallRecords).values({
      name: data.name,
      dcrDate: data.dcrDate,
      practice: data.practice,
      remarks: data.remarks,
      signature: data.signature,
      onlineId: onlineId,
      customerId: data.customerId,
      customerOnlineId: data.customerOnlineId,
      syncDate: onlineId ? new Date().toLocaleDateString() : "",
    });

    return true;
  } catch (err) {
    console.error(`❌ Failed to create customer :`, err);
    return false;
  }
}

export async function totalSalesOrder() {
  try {
    const db = await getDB();
    return (await db.select().from(salesOrdersSchema)).length;
  } catch (error) {
    console.error(`❌ Failed to create customer :`, error);
    return -1;
  }
}
const getDailySalesTotal = async (date: string) => {
  try {
    const db = await getDB();

    const result = await db.run(
      `SELECT SUM(CAST(total AS REAL)) AS daily_sales_total
       FROM sales_orders
       WHERE date_sold = '${date}'`
    );

    return result[0] ? result[0].daily_sales_total : 0;
  } catch (error) {
    console.error("Error fetching daily sales total:", error);
    return 0;
  }
};

const getMostSoldProductType = async (date: string) => {
  try {
    const db = await getDB();

    const result = await db
      .select()
      .from(salesOrdersSchema)
      .join(salesOrderItems, salesOrderItems.salesOrderId, salesOrdersSchema.id)
      .join(items, items.id, salesOrderItems.itemId)
      .where(salesOrdersSchema.dateSold, date)
      .groupBy(items.productType)
      .orderBy(desc(salesOrderItems.quantity)) // Assuming you want to order by the total quantity
      .limit(1); // Get the top-selling product type

    if (result.length > 0) {
      return {
        productType: result[0].productType,
        totalQuantitySold: result[0].quantity, // Adjust field name if needed
      };
    } else {
      return { productType: "None", totalQuantitySold: 0 };
    }
  } catch (error) {
    console.error("Error fetching most sold product type:", error);
    return { productType: "None", totalQuantitySold: 0 };
  }
};
