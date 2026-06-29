import { Plus, Power, RotateCw } from "lucide-react";
import { useState } from "react";
import { api } from "../lib/api.js";
import { timeAgo } from "../lib/format.js";
import EmptyState from "../shared/EmptyState.jsx";
import { SkeletonBlock } from "../shared/Skeleton.jsx";
import { useToast } from "../shared/ToastContext.jsx";
import { useAsync } from "../shared/useAsync.js";

export default function Platforms() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [form, setForm] = useState({ name: "", url_pattern: "" });
  const toast = useToast();
  const { loading, error, data } = useAsync(api.platforms, [refreshKey]);

  async function addPlatform(event) {
    event.preventDefault();
    await api.addPlatform({ ...form, user_id: "demo-user" });
    setForm({ name: "", url_pattern: "" });
    toast.push("تمت إضافة المنصة", "success");
    setRefreshKey((value) => value + 1);
  }

  async function togglePlatform(platform) {
    await api.updatePlatform(platform.id, { is_active: !platform.is_active });
    toast.push(platform.is_active ? "تم إيقاف المنصة" : "تم تفعيل المنصة", "success");
    setRefreshKey((value) => value + 1);
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
      <section className="panel p-5">
        <h3 className="text-lg font-extrabold">إضافة منصة مخصصة</h3>
        <form className="mt-5 space-y-4" onSubmit={addPlatform}>
          <label className="block">
            <span className="mb-2 block text-sm font-bold text-slate-600 dark:text-slate-300">اسم المنصة</span>
            <input
              className="field w-full"
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              placeholder="مثال: مورد القاهرة"
              required
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-bold text-slate-600 dark:text-slate-300">نمط الرابط</span>
            <input
              className="field w-full"
              value={form.url_pattern}
              onChange={(event) => setForm((current) => ({ ...current, url_pattern: event.target.value }))}
              placeholder="supplier.example.com"
              required
            />
          </label>
          <button className="btn-primary w-full">
            <Plus className="h-5 w-5" />
            إضافة المنصة
          </button>
        </form>
      </section>

      <section className="space-y-3">
        {loading && Array.from({ length: 4 }).map((_, index) => <SkeletonBlock key={index} className="h-24" />)}
        {error && <div className="panel p-5 text-danger">{error}</div>}
        {!loading && !error && data?.length === 0 && <EmptyState title="لا توجد منصات" description="أضف أول منصة ليبدأ الامتداد في مراقبتها." />}
        {!loading &&
          !error &&
          data?.map((platform) => (
            <article key={platform.id} className="panel flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`h-3 w-3 rounded-full ${platform.is_active ? "bg-accent" : "bg-slate-400"}`} />
                  <h3 className="font-extrabold">{platform.name}</h3>
                </div>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{platform.url_pattern}</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                  <RotateCw className="h-4 w-4" />
                  آخر مزامنة: {timeAgo(platform.last_sync_at)}
                </div>
                <button className="btn-ghost" onClick={() => togglePlatform(platform)}>
                  <Power className="h-4 w-4" />
                  {platform.is_active ? "إيقاف" : "تفعيل"}
                </button>
              </div>
            </article>
          ))}
      </section>
    </div>
  );
}
