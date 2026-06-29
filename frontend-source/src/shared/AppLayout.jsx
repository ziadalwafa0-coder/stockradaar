import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  Bell,
  Boxes,
  Gauge,
  Moon,
  PackageSearch,
  PlugZap,
  Settings,
  Sun,
  TrendingUp
} from "lucide-react";
import { useEffect, useState } from "react";
import { ToastProvider } from "./ToastContext.jsx";

const navItems = [
  { to: "/dashboard", label: "لوحة التحكم", icon: Gauge },
  { to: "/products", label: "المنتجات", icon: PackageSearch },
  { to: "/alerts", label: "التنبيهات", icon: Bell },
  { to: "/platforms", label: "المنصات", icon: PlugZap },
  { to: "/settings", label: "الإعدادات", icon: Settings }
];

const pageTitles = {
  "/dashboard": "نبض المخزون اليوم",
  "/products": "كل المنتجات المتتبعة",
  "/alerts": "مركز التنبيهات",
  "/platforms": "المنصات المتصلة",
  "/settings": "إعدادات التنبيه"
};

export default function AppLayout() {
  const [dark, setDark] = useState(() => localStorage.getItem("stockpulse-theme") === "dark");
  const location = useLocation();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("stockpulse-theme", dark ? "dark" : "light");
  }, [dark]);

  return (
    <ToastProvider>
      <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-slate-100">
        <aside className="fixed inset-y-0 right-0 z-30 hidden w-72 border-l border-slate-200 bg-white px-4 py-5 dark:border-slate-800 dark:bg-slate-900 lg:block">
          <div className="mb-8 flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-lg bg-primary text-white">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold">StockPulse</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">ذكاء المخزون للدروبشيبينج</p>
            </div>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-bold transition ${
                    isActive
                      ? "bg-primary text-white"
                      : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  }`
                }
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="absolute bottom-5 left-4 right-4 rounded-lg bg-slate-100 p-4 dark:bg-slate-800">
            <div className="flex items-center gap-2 text-sm font-bold">
              <Boxes className="h-5 w-5 text-accent" />
              وضع تجريبي جاهز
            </div>
            <p className="mt-2 text-xs leading-6 text-slate-500 dark:text-slate-400">
              اربط Supabase والامتداد لتبدأ المتابعة الحقيقية.
            </p>
          </div>
        </aside>

        <main className="lg:pr-72">
          <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
              <div>
                <p className="text-xs font-bold text-primary">StockPulse</p>
                <h2 className="text-xl font-extrabold sm:text-2xl">{pageTitles[location.pathname]}</h2>
              </div>
              <button className="btn-ghost h-11 w-11 px-0" onClick={() => setDark((value) => !value)} aria-label="تغيير الوضع">
                {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
            </div>
            <div className="flex gap-2 overflow-x-auto px-4 pb-3 lg:hidden">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold ${
                      isActive
                        ? "bg-primary text-white"
                        : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200"
                    }`
                  }
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              ))}
            </div>
          </header>

          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
            <Outlet />
          </div>
        </main>
      </div>
    </ToastProvider>
  );
}
