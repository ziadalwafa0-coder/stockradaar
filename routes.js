import express from "express";
import { z } from "zod";
import { classifyStockChange } from "./alerts.js";
import { config } from "./config.js";
import { supabaseAdmin } from "./supabase.js";
import {
  addMemoryPlatform,
  demoAlerts,
  demoPlatforms,
  demoProducts,
  ingestMemoryProducts,
  markMemoryAlertRead,
  memoryStockSeries,
  updateMemoryPlatform
} from "./mockStore.js";

export const router = express.Router();

const productInputSchema = z.object({
  product_id: z.union([z.string(), z.number()]).transform(String),
  product_name: z.string().min(1),
  current_quantity: z.number().int().min(0),
  price: z.number().optional().default(0),
  platform_name: z.string().optional(),
  image_url: z.string().url().optional().nullable(),
  timestamp: z.string().optional()
});

const ingestSchema = z.object({
  products: z.array(productInputSchema).min(1),
  platform: z.string().min(1),
  user_id: z.string().optional().default(config.defaultUserId)
});


async function getLastSnapshot(productId) {
  const { data, error } = await supabaseAdmin
    .from("stock_snapshots")
    .select("quantity, recorded_at")
    .eq("product_id", productId)
    .order("recorded_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}

async function upsertProduct(product, platform, userId) {
  const { data, error } = await supabaseAdmin
    .from("products")
    .upsert(
      {
        user_id: userId,
        platform,
        product_id: product.product_id,
        product_name: product.product_name,
        image_url: product.image_url || null,
        price: product.price || 0
      },
      { onConflict: "user_id,platform,product_id" }
    )
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function insertSnapshot(productRow, quantity, timestamp) {
  const { error } = await supabaseAdmin.from("stock_snapshots").insert({
    product_id: productRow.id,
    quantity,
    recorded_at: timestamp ? new Date(timestamp).toISOString() : new Date().toISOString()
  });

  if (error) throw error;
}

async function insertAlert({ userId, productId, oldQuantity, newQuantity, changeType, changePercent }) {
  const { data, error } = await supabaseAdmin
    .from("alerts")
    .insert({
      user_id: userId,
      product_id: productId,
      old_quantity: oldQuantity,
      new_quantity: newQuantity,
      change_type: changeType,
      change_percent: changePercent,
      is_read: false
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

router.get("/health", (req, res) => {
  res.json({ ok: true, service: "StockPulse API" });
});

router.post("/scrape/ingest", async (req, res, next) => {
  try {
    const payload = ingestSchema.parse(req.body);

    if (!supabaseAdmin) {
      const result = ingestMemoryProducts(payload);
      return res.status(201).json({
        mode: "memory",
        received: payload.products.length,
        snapshots_saved: result.snapshotsSaved,
        alerts_created: result.createdAlerts.length,
        message: "تم حفظ المنتجات الحقيقية مؤقتًا وعرضها في الداشبورد. اربط Supabase للحفظ الدائم."
      });
    }

    const createdAlerts = [];
    const snapshots = [];

    for (const product of payload.products) {
      const productRow = await upsertProduct(product, payload.platform, payload.user_id);
      const lastSnapshot = await getLastSnapshot(productRow.id);
      const oldQuantity = lastSnapshot?.quantity ?? null;
      const quantityChanged = oldQuantity === null || oldQuantity !== product.current_quantity;

      if (!quantityChanged) continue;

      await insertSnapshot(productRow, product.current_quantity, product.timestamp);
      snapshots.push(productRow.id);

      const { changeType, changePercent } = classifyStockChange(oldQuantity, product.current_quantity);
      if (changeType) {
        const alert = await insertAlert({
          userId: payload.user_id,
          productId: productRow.id,
          oldQuantity,
          newQuantity: product.current_quantity,
          changeType,
          changePercent
        });
        createdAlerts.push(alert);
      }
    }

    res.status(201).json({
      received: payload.products.length,
      snapshots_saved: snapshots.length,
      alerts_created: createdAlerts.length,
      alerts: createdAlerts
    });
  } catch (error) {
    next(error);
  }
});

router.get("/products", async (req, res, next) => {
  try {
    const { platform, alert_only: alertOnly, search } = req.query;

    if (!supabaseAdmin) {
      let data = [...demoProducts];
      if (platform) data = data.filter((item) => item.platform === platform);
      if (search) data = data.filter((item) => item.product_name.toLowerCase().includes(String(search).toLowerCase()));
      if (alertOnly === "true") data = data.filter((item) => Number(item.last_change || 0) !== 0);
      data.sort((a, b) => new Date(b.last_snapshot_at) - new Date(a.last_snapshot_at));
      return res.json({ data });
    }
    let query = supabaseAdmin
      .from("product_latest_stock")
      .select("*")
      .order("last_snapshot_at", { ascending: false });

    if (platform) query = query.eq("platform", platform);
    if (search) query = query.ilike("product_name", `%${search}%`);
    if (alertOnly === "true") query = query.not("last_change", "eq", 0);

    const { data, error } = await query;
    if (error) throw error;
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

router.get("/alerts", async (req, res, next) => {
  try {
    if (!supabaseAdmin) {
      return res.json({ data: sortAlerts(demoAlerts, req.query.sort) });
    }

    const sort = req.query.sort || "recent";
    let query = supabaseAdmin.from("alerts").select("*, products(*)");

    if (sort === "biggest_drop") {
      query = query.order("change_percent", { ascending: true });
    } else if (sort === "biggest_spike") {
      query = query.order("change_percent", { ascending: false });
    } else {
      query = query.order("created_at", { ascending: false });
    }

    const { data, error } = await query;
    if (error) throw error;
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

router.patch("/alerts/:id/read", async (req, res, next) => {
  try {
    if (!supabaseAdmin) {
      const alert = markMemoryAlertRead(req.params.id);
      if (!alert) return res.status(404).json({ error: "التنبيه غير موجود" });
      return res.json({ data: alert });
    }

    const { data, error } = await supabaseAdmin
      .from("alerts")
      .update({ is_read: true })
      .eq("id", req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

router.get("/dashboard/stats", async (req, res, next) => {
  try {
    if (!supabaseAdmin) {
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      const topMovers = [...demoProducts]
        .sort((a, b) => Math.abs(b.change_percent || 0) - Math.abs(a.change_percent || 0))
        .slice(0, 8);

      return res.json({
        data: {
          total_products: demoProducts.length,
          total_alerts_today: demoAlerts.filter((alert) => new Date(alert.created_at) >= startOfToday).length,
          platforms_active: demoPlatforms.filter((platform) => platform.is_active).length,
          biggest_move: topMovers[0]?.change_percent || 0,
          top_movers: topMovers,
          stock_series: memoryStockSeries()
        }
      });
    }

    const [{ count: totalProducts }, { count: totalAlertsToday }, { count: platformsActive }, movers] =
      await Promise.all([
        supabaseAdmin.from("products").select("*", { count: "exact", head: true }),
        supabaseAdmin
          .from("alerts")
          .select("*", { count: "exact", head: true })
          .gte("created_at", new Date(new Date().setHours(0, 0, 0, 0)).toISOString()),
        supabaseAdmin.from("platforms").select("*", { count: "exact", head: true }).eq("is_active", true),
        supabaseAdmin
          .from("product_latest_stock")
          .select("*")
          .gte("last_snapshot_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
          .order("change_percent", { ascending: false })
      ]);

    if (movers.error) throw movers.error;
    const topMovers = (movers.data || [])
      .sort((a, b) => Math.abs(b.change_percent || 0) - Math.abs(a.change_percent || 0))
      .slice(0, 8);

    res.json({
      data: {
        total_products: totalProducts || 0,
        total_alerts_today: totalAlertsToday || 0,
        platforms_active: platformsActive || 0,
        biggest_move: topMovers[0]?.change_percent || 0,
        top_movers: topMovers,
        stock_series: memoryStockSeries()
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get("/platforms", async (req, res, next) => {
  try {
    if (!supabaseAdmin) {
      return res.json({ data: demoPlatforms });
    }

    const { data, error } = await supabaseAdmin
      .from("platforms")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

router.post("/platforms", async (req, res, next) => {
  try {
    const schema = z.object({
      name: z.string().min(2),
      url_pattern: z.string().min(3),
      user_id: z.string().optional().default(config.defaultUserId)
    });
    const payload = schema.parse(req.body);

    if (!supabaseAdmin) {
      const data = addMemoryPlatform(payload);
      return res.status(201).json({ data, mode: "memory" });
    }

    const { data, error } = await supabaseAdmin
      .from("platforms")
      .insert({ ...payload, is_active: true })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ data });
  } catch (error) {
    next(error);
  }
});

router.patch("/platforms/:id", async (req, res, next) => {
  try {
    if (!supabaseAdmin) {
      const data = updateMemoryPlatform(req.params.id, req.body);
      if (!data) return res.status(404).json({ error: "المنصة غير موجودة" });
      return res.json({ data, mode: "memory" });
    }

    const { data, error } = await supabaseAdmin
      .from("platforms")
      .update(req.body)
      .eq("id", req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

function sortAlerts(alerts, sort = "recent") {
  if (sort === "biggest_drop") {
    return [...alerts].sort((a, b) => a.change_percent - b.change_percent);
  }

  if (sort === "biggest_spike") {
    return [...alerts].sort((a, b) => b.change_percent - a.change_percent);
  }

  return [...alerts].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}
