const now = new Date();
const hoursAgo = (hours) => new Date(now.getTime() - hours * 60 * 60 * 1000).toISOString();

export const demoProducts = [
  {
    id: "prod-hoodie",
    user_id: "demo-user",
    platform: "taager.com",
    product_id: "TA-2048",
    product_name: "هودي شتوي مبطن",
    image_url: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=240&q=80",
    price: 520,
    created_at: hoursAgo(72),
    latest_quantity: 42,
    previous_quantity: 68,
    last_change: -26,
    change_percent: -38.24,
    last_snapshot_at: hoursAgo(2)
  },
  {
    id: "prod-blender",
    user_id: "demo-user",
    platform: "safka-eg.com",
    product_id: "SF-1830",
    product_name: "خلاط محمول USB",
    image_url: "https://images.unsplash.com/photo-1570222094114-d054a817e56b?auto=format&fit=crop&w=240&q=80",
    price: 390,
    created_at: hoursAgo(60),
    latest_quantity: 130,
    previous_quantity: 70,
    last_change: 60,
    change_percent: 85.71,
    last_snapshot_at: hoursAgo(4)
  },
  {
    id: "prod-bag",
    user_id: "demo-user",
    platform: "vendor-eg.com",
    product_id: "VN-901",
    product_name: "شنطة ظهر مقاومة للماء",
    image_url: "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=240&q=80",
    price: 740,
    created_at: hoursAgo(120),
    latest_quantity: 0,
    previous_quantity: 17,
    last_change: -17,
    change_percent: -100,
    last_snapshot_at: hoursAgo(1)
  }
];

export const demoAlerts = [
  {
    id: "alert-1",
    user_id: "demo-user",
    product_id: "prod-bag",
    old_quantity: 17,
    new_quantity: 0,
    change_type: "out_of_stock",
    change_percent: -100,
    created_at: hoursAgo(1),
    is_read: false,
    products: demoProducts[2]
  },
  {
    id: "alert-2",
    user_id: "demo-user",
    product_id: "prod-blender",
    old_quantity: 70,
    new_quantity: 130,
    change_type: "spike",
    change_percent: 85.71,
    created_at: hoursAgo(4),
    is_read: false,
    products: demoProducts[1]
  },
  {
    id: "alert-3",
    user_id: "demo-user",
    product_id: "prod-hoodie",
    old_quantity: 68,
    new_quantity: 42,
    change_type: "drop",
    change_percent: -38.24,
    created_at: hoursAgo(2),
    is_read: true,
    products: demoProducts[0]
  }
];

export const demoPlatforms = [
  {
    id: "platform-1",
    user_id: "demo-user",
    name: "Taager",
    url_pattern: "taager.com",
    is_active: true,
    last_sync_at: hoursAgo(2),
    created_at: hoursAgo(100)
  },
  {
    id: "platform-2",
    user_id: "demo-user",
    name: "Safka",
    url_pattern: "safka-eg.com",
    is_active: true,
    last_sync_at: hoursAgo(4),
    created_at: hoursAgo(100)
  },
  {
    id: "platform-3",
    user_id: "demo-user",
    name: "Vendor EG",
    url_pattern: "vendor-eg.com",
    is_active: true,
    last_sync_at: hoursAgo(1),
    created_at: hoursAgo(100)
  }
];

export const demoStockSeries = [
  { label: "السبت", drops: 4, spikes: 2, out_of_stock: 1 },
  { label: "الأحد", drops: 7, spikes: 5, out_of_stock: 0 },
  { label: "الاثنين", drops: 5, spikes: 8, out_of_stock: 2 },
  { label: "الثلاثاء", drops: 10, spikes: 4, out_of_stock: 3 },
  { label: "الأربعاء", drops: 6, spikes: 9, out_of_stock: 1 },
  { label: "الخميس", drops: 8, spikes: 3, out_of_stock: 2 },
  { label: "اليوم", drops: 3, spikes: 6, out_of_stock: 1 }
];
