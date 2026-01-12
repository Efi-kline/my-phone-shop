# 📱 נקודת שיווק - חנות טלפונים מקוונת

חנות אונליין מתקדמת למכירת סמארטפונים עם מערכת הזמנות מלאה, בנויה עם Next.js 14 ו-Supabase.

## ✨ תכונות עיקריות

### 🛒 מערכת קניות מתקדמת
- **עגלת קניות חכמה** - הוספת מוצרים עם כמויות
- **ניהול כמויות** - שינוי כמות בעגלה עם כפתורי +/-
- **חישוב אוטומטי** - מחיר מתעדכן בזמן אמת
- **מערכת קופונים** - תמיכה בקודי הנחה (אחוזים/סכום קבוע)

### 📦 מערכת הזמנות
- **יצירת הזמנות** - שמירה אוטומטית בבסיס נתונים
- **היסטוריית הזמנות** - צפייה בכל ההזמנות הקודמות
- **ניהול סטטוסים** - ממתין / בטיפול / הושלם / בוטל
- **פרטי הזמנה מלאים** - כולל מוצרים, מחירים וקופונים

### 👤 ניהול משתמשים
- **התחברות רב-ערוצית** - אימייל + Google OAuth
- **רישום משתמשים** - עם אימות מלא
- **פרופיל אישי** - ניהול פרטים אישיים
- **הרשאות** - הפרדה בין משתמשים למנהלים

### 🔐 אבטחה
- **Row Level Security** - בטבלאות Supabase
- **Middleware מתקדם** - ניהול sessions אוטומטי
- **הגנה על נתיבים** - הפניה אוטומטית למשתמשים לא מחוברים

### 👨‍💼 פאנל ניהול (Admin)
- **הוספת מוצרים** - ממשק קל ונוח
- **עריכת מוצרים** - עדכון מחירים ותיאורים
- **ניהול מלאי** - תצוגה מסודרת של כל המוצרים
- **גישה מוגבלת** - רק למשתמשים עם הרשאת admin

## 🚀 טכנולוגיות

- **Next.js 14** - App Router + Server Components
- **TypeScript** - Type-safe קוד
- **Supabase** - Authentication + Database + RLS
- **Tailwind CSS** - עיצוב מודרני ומהיר
- **@supabase/ssr** - ניהול sessions בצד שרת

## 📋 דרישות מקדימות

- Node.js 18+
- npm או yarn
- חשבון Supabase (חינם)

## 🛠️ התקנה

### 1. שכפול הפרויקט
```bash
git clone <repository-url>
cd my-phone-shop
```

### 2. התקנת תלויות
```bash
npm install
```

### 3. הגדרת משתני סביבה
צור קובץ `.env.local` בשורש הפרויקט:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. הגדרת Supabase
עקוב אחרי ההוראות המפורטות ב-`SUPABASE_SETUP.md`:
- יצירת טבלאות: `profiles`, `phones`, `orders`
- הגדרת RLS (Row Level Security)
- הגדרת Authentication URLs

### 5. הרצת הפרויקט
```bash
npm run dev
```

גלוש אל `http://localhost:3000`

## 📂 מבנה הפרויקט

```
my-phone-shop/
├── src/
│   ├── app/
│   │   ├── page.tsx              # דף הבית
│   │   ├── login/                # התחברות/רישום
│   │   ├── profile/              # פרופיל משתמש
│   │   ├── cart/                 # עגלת קניות
│   │   ├── orders/               # היסטוריית הזמנות
│   │   ├── admin/                # פאנל ניהול
│   │   └── auth/callback/        # OAuth callback
│   ├── components/
│   │   ├── Navbar.tsx            # תפריט ניווט
│   │   └── ProductGrid.tsx       # תצוגת מוצרים
│   └── utils/supabase/
│       ├── client.ts             # Client-side Supabase
│       └── server.ts             # Server-side Supabase
├── middleware.ts                 # ניהול sessions
├── SUPABASE_SETUP.md            # הוראות Supabase
└── README.md                     # המסמך הזה
```

## 🎯 זרימת עבודה

### משתמש רגיל:
1. **רישום/התחברות** - דרך אימייל או Google
2. **גלישה בחנות** - צפייה במוצרים זמינים
3. **הוספה לעגלה** - בחירת מוצרים וכמויות
4. **החלת קופון** - הזנת קוד הנחה (אופציונלי)
5. **ביצוע הזמנה** - יצירת הזמנה חדשה
6. **צפייה בהזמנות** - מעקב אחר הזמנות קודמות

### מנהל (Admin):
1. **התחברות** - עם חשבון admin
2. **כניסה לפאנל ניהול** - דרך כפתור "ניהול חנות"
3. **הוספת מוצרים** - מילוי טופס פשוט
4. **עריכת מוצרים** - עדכון מחירים ופרטים

## 💳 קופוני הנחה זמינים

| קוד קופון | הנחה | סוג |
|-----------|------|-----|
| `WELCOME10` | 10% | אחוזים |
| `SAVE50` | ₪50 | סכום קבוע |
| `SPECIAL20` | 20% | אחוזים |
| `FREEDEAL` | ₪100 | סכום קבוע |

## 🗃️ טבלאות בבסיס הנתונים

### profiles
מידע על משתמשים:
- `id` (uuid, FK to auth.users)
- `email`, `full_name`, `phone`, `address`
- `role` ('user' / 'admin')
- `cart` (jsonb - עגלת קניות)

### phones
מוצרים זמינים:
- `id`, `name`, `description`
- `price`, `image_url`
- `created_at`

### orders
הזמנות שבוצעו:
- `id`, `user_id`
- `items` (jsonb - מערך מוצרים)
- `total`, `status`
- `coupon_code`, `discount_amount`
- `created_at`, `updated_at`

## 🌐 Deploy ל-Vercel

### 1. העלאת הקוד ל-GitHub
```bash
git push origin master
```

### 2. חיבור ל-Vercel
1. היכנס ל-[vercel.com](https://vercel.com)
2. לחץ על "New Project"
3. בחר את ה-Repository מ-GitHub
4. הוסף Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. עדכון Redirect URLs ב-Supabase
ב-Supabase Dashboard > Authentication > URL Configuration:
```
Site URL: https://your-domain.vercel.app
Redirect URLs:
  - https://your-domain.vercel.app/auth/callback
  - https://*.vercel.app/auth/callback
```

### 4. Deploy
לחץ על "Deploy" - הפרויקט יבנה ויעלה אוטומטית!

## 🔧 פיתוח נוסף

### הוספת קופון חדש
ערוך את `src/app/cart/page.tsx`:
```typescript
const coupons = {
  'NEWCODE': { discount: 15, type: 'percent' },
  // ... קופונים קיימים
};
```

### שינוי סטטוס הזמנה (בידנית)
```sql
UPDATE orders
SET status = 'completed'
WHERE id = 'order-uuid';
```

### הוספת אדמין חדש
```sql
UPDATE profiles
SET role = 'admin'
WHERE email = 'admin@example.com';
```

## 📸 צילומי מסך

*(ניתן להוסיף כאן צילומי מסך של האפליקציה)*

## 🐛 בעיות נפוצות

### בעיה: "Authentication session missing!"
**פתרון**: וודא שה-middleware מוגדר נכון ו-Cookies מאופשרים.

### בעיה: "Row Level Security policy violation"
**פתרון**: בדוק שהרצת את כל ה-SQL ב-`SUPABASE_SETUP.md`.

### בעיה: Google OAuth לא עובד
**פתרון**:
1. וודא שהוספת את כל ה-Redirect URLs ב-Supabase
2. בדוק שה-OAuth Provider מופעל ב-Supabase

## 📝 רישיון

MIT License - ניתן לשימוש חופשי.

## 👨‍💻 תורם

בנוי עם ❤️ בעזרת Claude Code

---

**גרסה נוכחית:** 1.0.0

**עדכון אחרון:** ינואר 2025
