import { routes } from "@/constants/Routes";
import { getDB } from "./db";
import { medrep } from "./schema";

export async function setMedrep(apiKey: string) {
  const db = await getDB();

  try {
    const res = await fetch(routes.medRep, {
      method: "get",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-API-KEY": `${apiKey}`,
      },
    });

    if (!res.ok) {
      console.warn(`⚠️ API responded with ${res.status} at `);
      return null;
    }

    const medrepData = await res.json();

    if (medrepData.length > 0) {
      await db
        .insert(medrep)
        .values({
          id: medrepData.id,
          name: medrepData.name,
          apiKey: medrepData.apiKey,
          productAppId: medrepData.productAppId,
          salesOrderAppId: medrepData.salesOrderAppId,
        })
        .onConflictDoUpdate({
          target: medrepData.id,
          set: {
            name: medrepData.name,
            apiKey: medrepData.apiKey,
            productAppId: medrepData.productAppId,
            salesOrderAppId: medrepData.salesOrderAppId,
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
