import { randomUUID } from "node:crypto";
import { classifyStockChange } from "./alerts.js";

export const demoProducts = [];
export const demoAlerts = [];
export const demoPlatforms = [];

function platformDisplayName(platform, suppliedName) {
  if (suppliedName) return suppliedName;
  if (platform.includes("safka")) return "Safka";
  if (platform.includes("taager")) return "Taager";
  if (platform.includes("vendor")) return "Vendor";
  return platform.replace(/^https?:\/\//, "").split("/")[0];
}

export function ingestMemoryProducts(payload) {
  const now = new Date().toISOString();
  const createdAlerts = [];
  let snapshotsSaved = 0;

  let platformRow = demoPlatforms.find(
    (item) => item.user_id === payload.user_id && item.url_pattern === payload.platform
  );

  if (!platformRow) {
    platformRow = {
      id: randomUUID(),
      user_id: payload.user_id,
      name: platformDisplayName(payload.platform, payload.products[0]?.platform_name),
      url_pattern: payload.platform,
      is_active: true,
      last_sync_at: now,
      created_at: now
    };
    demoPlatforms.push(platformRow);
  } else {
    platformRow.last_sync_at = now;
    platformRow.is_active = true;
  }

  for (const product of payload.products) {
    const timestamp = product.timestamp ? new Date(product.timestamp).toISOString() : now;
    let row = demoProducts.find(
      (item) =>
        item.user_id === payload.user_id &&
        item.platform === payload.platform &&
        item.product_id === product.product_id
    );

    const oldQuantity = row?.latest_quantity ?? null;
    const quantityChanged = oldQuantity === null || oldQuantity !== product.current_quantity;

    if (!row) {
      row = {
        id: randomUUID(),
        user_id: payload.user_id,
        platform: payload.platform,
        product_id: product.product_id,
        product_name: product.product_name,
        image_url: product.image_url || null,
        price: product.price || 0,
        created_at: timestamp,
        latest_quantity: product.current_quantity,
        previous_quantity: null,
        last_change: product.current_quantity,
        change_percent: 100,
        last_snapshot_at: timestamp
      };
      demoProducts.push(row);
    } else {
      row.product_name = product.product_name || row.product_name;
      row.image_url = product.image_url || row.image_url;
      row.price = product.price ?? row.price;

      if (quantityChanged) {
        row.previous_quantity = oldQuantity;
        row.latest_quantity = product.current_quantity;
        row.last_change = product.current_quantity - oldQuantity;
        row.last_snapshot_at = timestamp;
      }
    }

    if (!quantityChanged) continue;
    snapshotsSaved += 1;

    const { changeType, changePercent } = classifyStockChange(oldQuantity, product.current_quantity);
    row.change_percent = changePercent;

    if (changeType) {
      const alert = {
        id: randomUUID(),
        user_id: payload.user_id,
        product_id: row.id,
        old_quantity: oldQuantity,
        new_quantity: product.current_quantity,
        change_type: changeType,
        change_percent: changePercent,
        created_at: timestamp,
        is_read: false,
        products: row
      };
      demoAlerts.unshift(alert);
      createdAlerts.push(alert);
    }
  }

  return { snapshotsSaved, createdAlerts };
}

export function addMemoryPlatform(payload) {
  const now = new Date().toISOString();
  const existing = demoPlatforms.find(
    (item) => item.user_id === payload.user_id && item.url_pattern === payload.url_pattern
  );
  if (existing) return existing;

  const platform = {
    id: randomUUID(),
    ...payload,
    is_active: true,
    last_sync_at: null,
    created_at: now
  };
  demoPlatforms.unshift(platform);
  return platform;
}

export function updateMemoryPlatform(id, patch) {
  const platform = demoPlatforms.find((item) => item.id === id);
  if (!platform) return null;
  Object.assign(platform, patch);
  return platform;
}

export function markMemoryAlertRead(id) {
  const alert = demoAlerts.find((item) => item.id === id);
  if (!alert) return null;
  alert.is_read = true;
  return alert;
}

export function memoryStockSeries() {
  const formatter = new Intl.DateTimeFormat("ar-EG", { weekday: "short" });
  const days = [];
  for (let offset = 6; offset >= 0; offset -= 1) {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - offset);
    const next = new Date(date);
    next.setDate(next.getDate() + 1);
    const alerts = demoAlerts.filter((item) => {
      const at = new Date(item.created_at);
      return at >= date && at < next;
    });
    days.push({
      label: offset === 0 ? "اليوم" : formatter.format(date),
      drops: alerts.filter((item) => item.change_type === "drop").length,
      spikes: alerts.filter((item) => item.change_type === "spike").length,
      out_of_stock: alerts.filter((item) => item.change_type === "out_of_stock").length
    });
  }
  return days;
}
