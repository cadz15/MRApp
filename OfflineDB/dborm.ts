import { routes } from "@/constants/Routes";
import { getDB } from "./db";
import { medrep } from "./schema";

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
