import { Download, Mail, MonitorCheck, Save } from "lucide-react";
import { useState } from "react";
import { useToast } from "../shared/ToastContext.jsx";

export default function Settings() {
  const [settings, setSettings] = useState({
    drop: 20,
    spike: 50,
    inApp: true,
    email: false
  });
  const toast = useToast();

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
      <section className="panel p-5">
        <h3 className="text-lg font-extrabold">حدود التنبيه</h3>
        <div className="mt-6 space-y-6">
          <label className="block">
            <div className="mb-3 flex items-center justify-between">
              <span className="font-bold">نبهني عند انخفاض الكمية بنسبة</span>
              <span className="rounded-lg bg-danger/10 px-3 py-1 font-extrabold text-danger">{settings.drop}%</span>
            </div>
            <input
              type="range"
              min="5"
              max="80"
              value={settings.drop}
              onChange={(event) => setSettings((current) => ({ ...current, drop: Number(event.target.value) }))}
              className="w-full accent-red-500"
            />
          </label>
          <label className="block">
            <div className="mb-3 flex items-center justify-between">
              <span className="font-bold">نبهني عند ارتفاع الكمية بنسبة</span>
              <span className="rounded-lg bg-accent/10 px-3 py-1 font-extrabold text-accent">{settings.spike}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="150"
              value={settings.spike}
              onChange={(event) => setSettings((current) => ({ ...current, spike: Number(event.target.value) }))}
              className="w-full accent-emerald-500"
            />
          </label>
        </div>

        <div className="mt-8 border-t border-slate-200 pt-6 dark:border-slate-800">
          <h3 className="text-lg font-extrabold">طريقة الإشعار</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 p-4 dark:border-slate-800">
              <input
                type="checkbox"
                checked={settings.inApp}
                onChange={(event) => setSettings((current) => ({ ...current, inApp: event.target.checked }))}
                className="h-5 w-5 accent-indigo-500"
              />
              <MonitorCheck className="h-5 w-5 text-primary" />
              <span className="font-bold">داخل التطبيق</span>
            </label>
            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 p-4 dark:border-slate-800">
              <input
                type="checkbox"
                checked={settings.email}
                onChange={(event) => setSettings((current) => ({ ...current, email: event.target.checked }))}
                className="h-5 w-5 accent-indigo-500"
              />
              <Mail className="h-5 w-5 text-primary" />
              <span className="font-bold">البريد الإلكتروني</span>
            </label>
          </div>
        </div>

        <button
          className="btn-primary mt-8"
          onClick={() => toast.push("تم حفظ إعدادات التنبيه محليا", "success")}
        >
          <Save className="h-5 w-5" />
          حفظ الإعدادات
        </button>
      </section>

      <aside className="panel p-5">
        <h3 className="text-lg font-extrabold">امتداد كروم</h3>
        <p className="mt-3 leading-7 text-slate-500 dark:text-slate-400">
          ثبت الامتداد من مجلد extension ثم اربطه بعنوان الخادم المحلي أو خادم الإنتاج.
        </p>
        <a className="btn-primary mt-6 w-full" href="/extension.zip" download>
          <Download className="h-5 w-5" />
          رابط تحميل الامتداد
        </a>
      </aside>
    </div>
  );
}
