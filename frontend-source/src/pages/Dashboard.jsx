import { Activity, Bell, Boxes, Layers, TrendingUp } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { api } from "../lib/api.js";
import { nf, percent, timeAgo } from "../lib/format.js";
import ProductImage from "../shared/ProductImage.jsx";
import { SkeletonBlock, TableSkeleton } from "../shared/Skeleton.jsx";
import { useAsync } from "../shared/useAsync.js";

export default function Dashboard() {
  const { loading, error, data } = useAsync(api.stats, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <SkeletonBlock key={index} className="h-32" />
          ))}
        </div>
        <SkeletonBlock className="h-80" />
        <TableSkeleton rows={5} cols={5} />
      </div>
    );
  }

  if (error) {
    return <div className="panel p-5 text-danger">{error}</div>;
  }

  const cards = [
    { label: "المنتجات المتتبعة", value: nf.format(data.total_products), icon: Boxes, tone: "text-primary" },
    { label: "التنبيهات اليوم", value: nf.format(data.total_alerts_today), icon: Bell, tone: "text-danger" },
    { label: "المنصات النشطة", value: nf.format(data.platforms_active), icon: Layers, tone: "text-accent" },
    { label: "أكبر حركة", value: percent(data.biggest_move), icon: Activity, tone: "text-amber-500" }
  ];

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div className="panel p-5" key={card.label}>
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400">{card.label}</p>
              <card.icon className={`h-5 w-5 ${card.tone}`} />
            </div>
            <p className="mt-4 text-3xl font-extrabold">{card.value}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <div className="panel p-5">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-extrabold">تغيرات المخزون خلال الأسبوع</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">انخفاضات وارتفاعات ونفاد مخزون</p>
            </div>
            <TrendingUp className="h-6 w-6 text-primary" />
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.stock_series}>
                <defs>
                  <linearGradient id="spike" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="drop" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip />
                <Area dataKey="spikes" name="ارتفاعات" stroke="#10B981" fill="url(#spike)" strokeWidth={3} />
                <Area dataKey="drops" name="انخفاضات" stroke="#EF4444" fill="url(#drop)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel overflow-hidden">
          <div className="border-b border-slate-200 p-5 dark:border-slate-800">
            <h3 className="text-lg font-extrabold">أكبر حركة آخر ٢٤ ساعة</h3>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {data.top_movers.slice(0, 5).map((product) => (
              <div key={product.id} className="flex items-center gap-3 p-4">
                <ProductImage src={product.image_url} name={product.product_name} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold">{product.product_name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{product.platform} · {timeAgo(product.last_snapshot_at)}</p>
                </div>
                <span className={product.change_percent >= 0 ? "font-extrabold text-accent" : "font-extrabold text-danger"}>
                  {percent(product.change_percent)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
