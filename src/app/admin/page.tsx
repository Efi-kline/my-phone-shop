'use client';
import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';

export default function AdminPage() {
  const supabase = createClientComponentClient();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  
  // מצב הטופס - תומך גם בהוספה וגם בעריכה
  const [form, setForm] = useState({ id: null, name: '', price: '', description: '', image_url: '' });

  // טעינת המוצרים
  const fetchProducts = async () => {
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (data) setProducts(data);
  };

  useEffect(() => { fetchProducts(); }, []);

  // העלאת תמונה ל-Storage
  const handleImageUpload = async (e: any) => {
    try {
      setUploading(true);
      const file = e.target.files[0];
      const filePath = `products/${Math.random()}-${file.name}`;
      const { error } = await supabase.storage.from('phone-images').upload(filePath, file);
      if (error) throw error;
      const { data } = supabase.storage.from('phone-images').getPublicUrl(filePath);
      setForm({ ...form, image_url: data.publicUrl });
    } catch (err) { 
      alert("שגיאה בהעלאה - וודא שהבאקט phone-images קיים ומוגדר כציבורי"); 
    } finally { setUploading(false); }
  };

  // שמירה (הוספה או עדכון)
  const handleSubmit = async () => {
    setLoading(true);
    const productData = { name: form.name, price: parseFloat(form.price), description: form.description, image_url: form.image_url };
    
    const { error } = form.id 
      ? await supabase.from('products').update(productData).eq('id', form.id)
      : await supabase.from('products').insert([productData]);

    if (!error) {
      alert(form.id ? "המכשיר עודכן!" : "המכשיר נוסף בהצלחה!");
      setForm({ id: null, name: '', price: '', description: '', image_url: '' });
      fetchProducts();
    } else {
      alert("שגיאה בשמירה: " + error.message);
    }
    setLoading(false);
  };

  // מחיקת מוצר
  const deleteProduct = async (id: string) => {
    if (!confirm("האם אתה בטוח שברצונך למחוק מכשיר זה?")) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (!error) fetchProducts();
  };

  return (
    <div className="min-h-screen p-4 md:p-8 bg-slate-50 text-right" dir="rtl">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* כפתור חזרה לדף הבית */}
        <Link href="/" className="text-blue-600 hover:underline font-bold">← חזרה לחנות</Link>

        {/* טופס ניהול */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <h1 className="text-2xl font-black mb-6">{form.id ? 'עריכת מכשיר' : 'הוספת מכשיר חדש'}</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" placeholder="שם המכשיר" className="p-4 bg-slate-50 border rounded-2xl outline-none" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} />
            <input type="number" placeholder="מחיר" className="p-4 bg-slate-50 border rounded-2xl outline-none" value={form.price} onChange={(e) => setForm({...form, price: e.target.value})} />
            <textarea placeholder="תיאור המכשיר..." className="p-4 bg-slate-50 border rounded-2xl outline-none h-24 md:col-span-2" value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} />
            <div className="md:col-span-2 border-2 border-dashed border-slate-200 p-4 rounded-2xl text-center">
              <input type="file" onChange={handleImageUpload} className="hidden" id="upload" />
              <label htmlFor="upload" className="cursor-pointer block">
                {form.image_url ? (
                  <div className="relative inline-block">
                    <img src={form.image_url} className="h-24 mx-auto rounded-xl shadow-sm" />
                    <span className="text-xs text-blue-500 mt-2 block">לחץ להחלפה</span>
                  </div>
                ) : (uploading ? 'מעלה תמונה...' : '📸 לחץ להעלאת תמונת מכשיר')}
              </label>
            </div>
            <button 
              disabled={loading || uploading || !form.image_url} 
              onClick={handleSubmit} 
              className="md:col-span-2 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-blue-600 transition-all disabled:bg-slate-300"
            >
              {loading ? 'מעבד...' : form.id ? 'עדכן פרטי מכשיר' : 'פרסם מכשיר חדש'}
            </button>
            {form.id && (
              <button onClick={() => setForm({ id: null, name: '', price: '', description: '', image_url: '' })} className="md:col-span-2 text-slate-400 text-sm">ביטול עריכה</button>
            )}
          </div>
        </div>

        {/* טבלת מלאי */}
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden border border-slate-100">
          <div className="p-6 border-b bg-slate-800 text-white">
            <h2 className="font-bold">מלאי קיים בחנות ({products.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-sm">
                  <th className="p-4">תמונה</th>
                  <th className="p-4">שם דגם</th>
                  <th className="p-4">מחיר</th>
                  <th className="p-4">פעולות</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-b hover:bg-slate-50 transition-colors">
                    <td className="p-4"><img src={p.image_url} className="w-12 h-12 object-cover rounded-lg shadow-sm" /></td>
                    <td className="p-4 font-bold text-slate-900">{p.name}</td>
                    <td className="p-4 text-blue-600 font-bold">₪{p.price}</td>
                    <td className="p-4 space-x-4 space-x-reverse">
                      <button onClick={() => setForm(p)} className="text-blue-500 hover:text-blue-700 font-medium">ערוך</button>
                      <button onClick={() => deleteProduct(p.id)} className="text-red-500 hover:text-red-700 font-medium">מחק</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}