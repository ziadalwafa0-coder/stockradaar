export const nf = new Intl.NumberFormat("ar-EG");
export const currency = new Intl.NumberFormat("ar-EG", {
  style: "currency",
  currency: "EGP",
  maximumFractionDigits: 0
});

export function percent(value = 0) {
  const number = Number(value || 0);
  return `${number > 0 ? "+" : ""}${nf.format(number)}%`;
}

export function timeAgo(value) {
  if (!value) return "لا يوجد";
  const date = new Date(value);
  const diff = Math.max(0, Date.now() - date.getTime());
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "الآن";
  if (minutes < 60) return `منذ ${nf.format(minutes)} دقيقة`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `منذ ${nf.format(hours)} ساعة`;
  const days = Math.floor(hours / 24);
  return `منذ ${nf.format(days)} يوم`;
}

export function changeTypeLabel(type) {
  return {
    drop: "انخفاض مفاجئ",
    spike: "ارتفاع مفاجئ",
    new: "منتج جديد",
    out_of_stock: "نفد المخزون"
  }[type] || "تغيير";
}
