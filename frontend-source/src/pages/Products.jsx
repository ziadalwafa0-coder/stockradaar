import { Filter, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { api } from "../lib/api.js";
import { currency, nf, percent, timeAgo } from "../lib/format.js";
import EmptyState from "../shared/EmptyState.jsx";
import ProductImage from "../shared/ProductImage.jsx";
import { TableSkeleton } from "../shared/Skeleton.jsx";
import { useAsync } from "../shared/useAsync.js";

export default function Products() {
  const [filters, setFilters] = useState({ search: "", platform: "", alert_only: "" });
  const { loading, error, data } = useAsync(() => api.products(filters), [filters.search, filters.platform, filters.alert_only]);
  const platforms = useMemo(() => [...new Set((data || []).map((product) => product.platform))], [data]);

  return (
    <div className="space-y-5">
      <section className="panel p-4">
        <div className="grid gap-3 md:grid-cols-[1fr_220px_180px]">
          <label className="relative">
            <Search className="pointer-events-none absolute right-3 top-3 h-5 w-5 text-slate-400" />
            <input
              className="field w-full pr-10"
              placeholder="ابحث باسم المنتج"
              value={filters.search}
              onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
            />
          </label>
          <select
            className="field"
            value={filters.platform}
            onChange={(event) => setFilters((current) => ({ ...current, platform: event.target.value }))}
          >
            <option value="">كل المنصات</option>
            {platforms.map((platform) => (
              <option value={platform} key={platform}>
                {platform}
              </option>
            ))}
          </select>
          <select
            className="field"
            value={filters.alert_only}
            onChange={(event) => setFilters((current) => ({ ...current, alert_only: event.target.value }))}
          >
            <option value="">كل التغييرات</option>
            <option value="true">منتجات عليها تغيير</option>
          </select>
        </div>
      </section>

      {loading && <TableSkeleton rows={7} cols={6} />}
      {error && <div className="panel p-5 text-danger">{error}</div>}
      {!loading && !error && data?.length === 0 && (
        <EmptyState title="لا توجد منتجات مطابقة" description="جرب تغيير البحث أو الفلاتر الحالية." />
      )}
      {!loading && !error && data?.length > 0 && (
        <section className="panel overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[840px] text-right">
              <thead className="table-head">
                <tr>
                  <th className="px-4 py-3">الصورة</th>
                  <th className="px-4 py-3">الاسم</th>
                  <th className="px-4 py-3">المنصة</th>
                  <th className="px-4 py-3">الكمية الحالية</th>
                  <th className="px-4 py-3">آخر تغيير</th>
                  <th className="px-4 py-3">التغيير %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {data.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/60">
                    <td className="px-4 py-3">
                      <ProductImage src={product.image_url} name={product.product_name} />
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-bold">{product.product_name}</p>
                      <p className="text-xs text-slate-500">{currency.format(product.price || 0)}</p>
                    </td>
                    <td className="px-4 py-3 text-sm">{product.platform}</td>
                    <td className="px-4 py-3 font-extrabold">{nf.format(product.latest_quantity || 0)}</td>
                    <td className="px-4 py-3 text-sm">{timeAgo(product.last_snapshot_at)}</td>
                    <td className="px-4 py-3">
                      <span className={Number(product.change_percent) >= 0 ? "font-extrabold text-accent" : "font-extrabold text-danger"}>
                        {percent(product.change_percent)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
