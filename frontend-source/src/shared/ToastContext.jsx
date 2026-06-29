import { createContext, useContext, useMemo, useState } from "react";
import { Bell, CheckCircle2, X } from "lucide-react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const api = useMemo(
    () => ({
      push(message, tone = "info") {
        const id = crypto.randomUUID();
        setToasts((items) => [...items, { id, message, tone }]);
        setTimeout(() => {
          setToasts((items) => items.filter((toast) => toast.id !== id));
        }, 3600);
      }
    }),
    []
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="fixed bottom-4 left-4 z-50 flex w-[calc(100%-2rem)] max-w-sm flex-col gap-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="panel flex items-center gap-3 border-r-4 border-r-primary p-3 text-sm text-slate-700 dark:text-slate-100"
          >
            {toast.tone === "success" ? (
              <CheckCircle2 className="h-5 w-5 text-accent" />
            ) : (
              <Bell className="h-5 w-5 text-primary" />
            )}
            <span className="flex-1">{toast.message}</span>
            <button
              className="rounded-md p-1 hover:bg-slate-100 dark:hover:bg-slate-800"
              onClick={() => setToasts((items) => items.filter((item) => item.id !== toast.id))}
              aria-label="إغلاق"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
