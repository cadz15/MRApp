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

    await res.json();

    await db
      .insert(medrep)
      .values({
        id: medrep.id,
        name: medrep.name,
        apiKey: medrep.apiKey,
        productAppId: medrep.productAppId,
        salesOrderAppId: medrep.salesOrderAppId,
      })
      .onConflictDoUpdate({
        target: medrep.id,
        set: {
          name: medrep.name,
          apiKey: medrep.apiKey,
          productAppId: medrep.productAppId,
          salesOrderAppId: medrep.salesOrderAppId,
        },
      });
  } catch (err) {
    console.error(`❌ Failed to fetch :`, err);
    return null;
  }
}
