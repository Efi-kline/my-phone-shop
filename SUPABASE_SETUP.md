# מדריך הגדרת Supabase

## טבלאות נדרשות

### 1. טבלת `profiles` (קיימת)
טבלה זו כבר אמורה להיות קיימת עם השדות הבאים:
- `id` (uuid, primary key, references auth.users)
- `email` (text)
- `full_name` (text)
- `phone` (text)
- `address` (text)
- `role` (text, default: 'user')
- `cart` (jsonb, default: '[]')
- `created_at` (timestamp)

### 2. טבלת `phones` (קיימת)
טבלה זו כבר אמורה להיות קיימת עם השדות הבאים:
- `id` (uuid, primary key, default: uuid_generate_v4())
- `name` (text)
- `description` (text)
- `price` (numeric)
- `image_url` (text)
- `created_at` (timestamp)

### 3. טבלת `orders` (חדשה - צריך ליצור!)

#### SQL ליצירת הטבלה:

```sql
-- יצירת טבלת הזמנות
CREATE TABLE IF NOT EXISTS public.orders (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    items jsonb NOT NULL DEFAULT '[]',
    total numeric NOT NULL,
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled')),
    coupon_code text,
    discount_amount numeric DEFAULT 0,
    delivery_address text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- יצירת אינדקס לשליפה מהירה
CREATE INDEX orders_user_id_idx ON public.orders(user_id);
CREATE INDEX orders_status_idx ON public.orders(status);
CREATE INDEX orders_created_at_idx ON public.orders(created_at DESC);

-- הוספת RLS (Row Level Security)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- מדיניות: משתמשים יכולים לראות רק את ההזמנות שלהם
CREATE POLICY "Users can view own orders"
ON public.orders
FOR SELECT
USING (auth.uid() = user_id);

-- מדיניות: משתמשים יכולים ליצור הזמנות חדשות
CREATE POLICY "Users can create own orders"
ON public.orders
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- מדיניות: אדמינים יכולים לראות את כל ההזמנות
CREATE POLICY "Admins can view all orders"
ON public.orders
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);

-- מדיניות: אדמינים יכולים לעדכן הזמנות (שינוי סטטוס וכו')
CREATE POLICY "Admins can update all orders"
ON public.orders
FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);

-- פונקציה לעדכון אוטומטי של updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- טריגר לעדכון updated_at
CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

## שלבי ההגדרה בקונסול Supabase:

### שלב 1: כניסה ל-SQL Editor
1. היכנס לפרויקט שלך ב-Supabase
2. לחץ על "SQL Editor" בתפריט הצד

### שלב 2: הרצת ה-SQL
1. העתק את כל ה-SQL למעלה
2. הדבק ב-SQL Editor
3. לחץ על "Run" (או Ctrl+Enter)

### שלב 3: אימות
1. לך ל-"Table Editor"
2. ודא שהטבלה `orders` נוצרה בהצלחה
3. בדוק שיש את כל השדות הנדרשים

## הגדרות Authentication בוורסל:

### Environment Variables ב-Vercel:
```
NEXT_PUBLIC_SUPABASE_URL=https://bjitsknozmmalupqchtf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<המפתח שלך>
```

### Redirect URLs ב-Supabase:
בקונסול Supabase > Authentication > URL Configuration:

**Site URL:**
```
https://your-domain.vercel.app
```

**Redirect URLs (הוסף את כל הדומיינים):**
```
http://localhost:3000/auth/callback
https://your-domain.vercel.app/auth/callback
https://*.vercel.app/auth/callback
```

## בדיקת הטבלה:

אחרי יצירת הטבלה, נסה להריץ שאילתה לבדיקה:

```sql
-- בדיקה שהטבלה קיימת
SELECT * FROM public.orders LIMIT 1;

-- בדיקת RLS
SELECT * FROM public.orders WHERE user_id = auth.uid();
```

## מבנה ה-items (JSONB):

כל הזמנה מכילה מערך של פריטים בפורמט הבא:
```json
[
  {
    "id": "uuid-of-product",
    "name": "iPhone 15 Pro",
    "price": 5000,
    "quantity": 2,
    "image_url": "https://..."
  }
]
```

## שאילתות שימושיות:

### הזמנות של משתמש ספציפי:
```sql
SELECT * FROM orders
WHERE user_id = 'user-uuid'
ORDER BY created_at DESC;
```

### עדכון סטטוס הזמנה (אדמין):
```sql
UPDATE orders
SET status = 'completed'
WHERE id = 'order-uuid';
```

### סטטיסטיקות מכירות:
```sql
SELECT
    COUNT(*) as total_orders,
    SUM(total) as total_revenue,
    AVG(total) as average_order_value
FROM orders
WHERE status = 'completed';
```

## שדרוג עתידי אפשרי:

### הוספת מעקב משלוחים:
```sql
ALTER TABLE orders ADD COLUMN tracking_number text;
ALTER TABLE orders ADD COLUMN carrier text;
ALTER TABLE orders ADD COLUMN estimated_delivery date;
```

### הוספת הערות פנימיות:
```sql
ALTER TABLE orders ADD COLUMN admin_notes text;
```

### הוספת היסטוריית סטטוסים:
```sql
CREATE TABLE order_status_history (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
    old_status text,
    new_status text,
    changed_by uuid REFERENCES auth.users(id),
    changed_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);
```
