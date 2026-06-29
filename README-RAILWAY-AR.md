# StockPulse Full-Stack Dashboard — Railway Ready

هذه النسخة تعرض الداشبورد والـAPI من نفس رابط Railway.

## الرفع

1. فك الضغط.
2. ارفع **كل الملفات داخل المجلد** إلى جذر مستودع GitHub الحالي بدل الملفات القديمة.
3. في Railway استخدم:
   - Root Directory: فارغ
   - Start Command: `node server.js`
4. اعمل Redeploy.

بعد النشر:
- الداشبورد: `https://YOUR-DOMAIN.up.railway.app/`
- فحص الـAPI: `https://YOUR-DOMAIN.up.railway.app/api/health`
- المنتجات: `https://YOUR-DOMAIN.up.railway.app/products`

## البيانات الحقيقية

بدون Supabase، المنتجات التي يرسلها الامتداد ستظهر فعلًا في الداشبورد، لكنها محفوظة مؤقتًا في ذاكرة السيرفر وقد تختفي عند إعادة تشغيل Railway.
للحفظ الدائم أضف متغيرات Supabase وشغّل ملف قاعدة البيانات الموجود داخل `supabase/001_initial_schema.sql` في المشروع الأصلي.
