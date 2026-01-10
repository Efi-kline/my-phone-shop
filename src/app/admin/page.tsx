'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';

export default function AdminPage() {
  const supabase = createClientComponentClient();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // מצב טופס להוספה/עריכה
  const [form, setForm] = useState({
    id: null,
    name: '',
    price: '',
    description: '',
    image_url: ''
  });

  // טעינת מוצרים מהמסד
  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setProducts(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // שמירת מוצר (חדש או קיים)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const productData = {
      name: form.name,
      price: parseFloat(form.price),
      description: form.description,
      image_url: form.image_url
    };

    if (form.id) {
      // עדכון מוצר קיים
      await supabase.from('products').update(productData).eq('id', form.id);
    } else {
      // הוספת מוצר חדש
      await supabase.from('products').insert([productData]);
    }

    setForm({ id: null, name: '', price: '', description: '', image_url: '' });
    fetchProducts();
  };

  const deleteProduct = async (id: string) => {
    if (confirm('האם אתה בטוח שברצונך למחוק מוצר זה?')) {
      await supabase.from('products').delete().eq('id', id);
      fetchProducts();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-black text-slate-800">ניהול מלאי</h1>
          <Link href="/" className="text-blue-600 hover:underline">חזרה לחנות ←</Link>
        </div>

        {/* טופס הוספה/עריכה */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border mb-8">
          <h2 className="text-xl font-bold mb-4">{form.id ? 'עריכת מוצר' : 'הוספת מוצר חדש'}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input 
              placeholder="שם המכשיר" 
              className="p-3 bg-slate-50 border rounded-xl"
              value={form.name}
              onChange={e => setForm({...form, name: e.target.value})}
              required
            />
            <input 
              placeholder="מחיר (₪)" 
              type="number"
              className="p-3 bg-slate-50 border rounded-xl"
              value={form.price}
              onChange={e => setForm({...form, price: e.target.value})}
              required
            />
            <input 
              placeholder="כתובת תמונה (URL)" 
              className="p-3 bg-slate-50 border rounded-xl md:col-span-2"
              value={form.image_url}
              onChange={e => setForm({...form, image_url: e.target.value})}
            />
            <textarea 
              placeholder="תיאור המכשיר" 
              className="p-3 bg-slate-50 border rounded-xl md:col-span-2 h-24"
              value={form.description}
              onChange={e => setForm({...form, description: e.target.value})}
            />
            <button type="submit" className="md:col-span-2 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all">
              {form.id ? 'עדכן מכשיר' : 'פרסם מכשיר חדש'}
            </button>
            {form.id && (
              <button onClick={() => setForm({id: null, name: '', price: '', description: '', image_url: ''})} className="md:col-span-2 text-slate-500 text-sm">ביטול עריכה</button>
            )}
          </form>
        </div>

        {/* טבלת מוצרים */}
        <div className="bg-white rounded-3xl shadow-sm border overflow-hidden">
          <table className="w-full text-right">
            <thead className="bg-slate-800 text-white">
              <tr>
                <th className="p-4">מוצר</th>
                <th className="p-4">מחיר</th>
                <th className="p-4">פעולות</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={3} className="p-10 text-center text-slate-400">טוען נתונים...</td></tr>
              ) : products.map(product => (
                <tr key={product.id} className="border-b hover:bg-slate-50">
                  <td className="p-4 font-bold">{product.name}</td>
                  <td className="p-4 text-blue-600 font-black">₪{product.price}</td>
                  <td className="p-4 flex gap-4">
                    <button onClick={() => setForm(product)} className="text-blue-500 font-bold hover:underline">ערוך</button>
                    <button onClick={() => deleteProduct(product.id)} className="text-red-500 font-bold hover:underline">מחק</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}