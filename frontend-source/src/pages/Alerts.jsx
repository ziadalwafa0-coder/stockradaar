import { Check, SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { api } from "../lib/api.js";
import { changeTypeLabel, nf, percent, timeAgo } from "../lib/format.js";
import EmptyState from "../shared/EmptyState.jsx";
import ProductImage from "../shared/ProductImage.jsx";
import { SkeletonBlock } from "../shared/Skeleton.jsx";
import { useToast } from "../shared/ToastContext.jsx";
import { useAsync } from "../shared/useAsync.js";

const tones = {
  drop: "border-r-danger bg-danger/5 text-danger",
  spike: "border-r-accent bg-accent/5 text-accent",
  new: "border-r-blue-500 bg-blue-500/5 text-blue-500",
  out_of_stock: "border-r-slate-500 bg-slate-500/5 text-slate-500"
};

export default function Alerts() {
  const [sort, setSort] = useState("recent");
  const [refreshKey, setRefreshKey] = useState(0);
  const toast = useToast();
  const { loading, error, data } = useAsync(() => api.alerts(sort), [sort, refreshKey]);

  async function markRead(id) {
    await api.markAlertRead(id);
    toast.push("تم تعليم التنبيه كمقروء", "success");
    setRefreshKey((value) => value + 1);
  }

  return (
    <div className="space-y-5">
      <section className="panel flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 font-extrabold">
          <SlidersHorizontal className="h-5 w-5 text-primary" />
          ترتيب التنبيهات
        </div>
        <select className="field sm:w-56" value={sort} onChange={(event) => setSort(event.target.value)}>
          <option value="recent">الأحدث أولا</option>
          <option value="biggest_drop">أكبر انخفاض</option>
          <option value="biggest_spike">أكبر ارتفاع</option>
        </select>
      </section>

      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <SkeletonBlock key={index} className="h-28" />
          ))}
        </div>
      )}
      {error && <div className="panel p-5 text-danger">{error}</div>}
      {!loading && !error && data?.length === 0 && (
        <EmptyState title="لا توجد تنبيهات" description="عندما يلتقط الامتداد حركة مهمة في المخزون ستظهر هنا." />
      )}
      {!loading && !error && data?.length > 0 && (
        <div className="space-y-3">
          {data.map((alert) => {
            const product = alert.products || {};
            return (
              <article
                key={alert.id}
                className={`panel border-r-4 p-4 ${tones[alert.change_type] || tones.drop}`}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <ProductImage src={product.image_url} name={product.product_name} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-extrabold text-slate-950 dark:text-slate-100">{product.product_name}</h3>
                      {!alert.is_read && <span className="rounded-lg bg-primary px-2 py-1 text-xs font-bold text-white">جديد</span>}
                    </div>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      {product.platform} · {timeAgo(alert.created_at)}
                    </p>
                  </div>
                  <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {nf.format(alert.old_quantity ?? 0)} ← {nf.format(alert.new_quantity)}
                  </div>
                  <div className="text-lg font-extrabold">{percent(alert.change_percent)}</div>
                  <div className="rounded-lg bg-white px-3 py-2 text-sm font-extrabold shadow-sm dark:bg-slate-950">
                    {changeTypeLabel(alert.change_type)}
                  </div>
                  <button className="btn-ghost" onClick={() => markRead(alert.id)} disabled={alert.is_read}>
                    <Check className="h-4 w-4" />
                    مقروء
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
