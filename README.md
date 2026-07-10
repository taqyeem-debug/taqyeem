# منصّة التقييم

مشروع React + Vite جاهز للنشر على GitHub Pages.

## ملفات التشغيل الأساسية

هذه النسخة محفوظ فيها كود المنصة كما هو داخل `src/` وملفات التشغيل والإعدادات اللازمة فقط، مع إضافة ملف النشر الآلي:

```txt
.github/workflows/deploy.yml
src/
public/
index.html
package.json
package-lock.json
tsconfig.json
vite.config.ts
firebase-applet-config.json
firebase.json
firestore.rules
.gitignore
.env.example
README.md
```

## ما التعديلات المضافة؟

1. إضافة GitHub Actions للنشر التلقائي على GitHub Pages.
2. حذف الدخول التجريبي الثابت `admin@admin.com` من صفحة تسجيل الدخول.
3. إصلاح تعريفات TypeScript بإضافة حقول الأخطاء إلى نوع الجلسة.
4. تعديل مسار الشعار ليعمل على GitHub Pages سواء كان الموقع على دومين خاص أو داخل مسار مستودع.
5. تعديل قواعد Firestore بحيث تبقى القراءة متاحة لوضع الزائر، لكن الكتابة والتعديل والحذف لا تتم إلا لمستخدم مسجل دخوله في Firebase Authentication.

## طريقة النشر

1. ارفع محتويات هذا المجلد إلى مستودع GitHub.
2. من إعدادات المستودع افتح:

```txt
Settings → Pages
```

3. اختر:

```txt
Source: GitHub Actions
```

4. ادفع الملفات إلى فرع `main` وسيبدأ النشر تلقائيًا.

## أوامر التشغيل المحلي

```bash
npm ci
npm run dev
```

## أوامر الفحص والبناء

```bash
npm run lint
npm run build
```
