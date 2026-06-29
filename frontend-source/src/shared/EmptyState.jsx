import { Inbox } from "lucide-react";

export default function EmptyState({ title = "لا توجد بيانات", description = "ستظهر النتائج هنا عند توفرها." }) {
  return (
    <div className="panel grid min-h-64 place-items-center p-8 text-center">
      <div>
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300">
          <Inbox className="h-7 w-7" />
        </div>
        <h3 className="mt-4 text-lg font-extrabold">{title}</h3>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{description}</p>
      </div>
    </div>
  );
}
