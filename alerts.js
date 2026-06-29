export function classifyStockChange(oldQuantity, newQuantity, thresholds = {}) {
  if (oldQuantity === null || oldQuantity === undefined) {
    return { changeType: "new", changePercent: 100 };
  }

  if (newQuantity === 0) {
    return { changeType: "out_of_stock", changePercent: -100 };
  }

  const base = oldQuantity === 0 ? 1 : oldQuantity;
  const changePercent = Number((((newQuantity - oldQuantity) / base) * 100).toFixed(2));
  const dropThreshold = Number(thresholds.drop_percent ?? 20);
  const spikeThreshold = Number(thresholds.spike_percent ?? 50);

  if (changePercent <= -dropThreshold) {
    return { changeType: "drop", changePercent };
  }

  if (changePercent >= spikeThreshold) {
    return { changeType: "spike", changePercent };
  }

  return { changeType: null, changePercent };
}

export function alertLabel(type) {
  const labels = {
    drop: "انخفاض مفاجئ",
    spike: "ارتفاع مفاجئ",
    new: "منتج جديد",
    out_of_stock: "نفد المخزون"
  };

  return labels[type] || "تغيير في المخزون";
}
