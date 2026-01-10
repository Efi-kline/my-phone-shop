'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';

export default function AdminPage() {
  const [supabase] = useState(() =>
    createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  );
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [form, setForm] = useState({
    id: null,
    name: '',
    price: '',
    description: '',
    image_url: ''
  });

  const fetchProducts = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setProducts(data);
    setLoading(false);
  };

  useEffect(() => {
    const checkAdminAccess = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setCheckingAuth(false);
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile?.role === 'admin') {
        setIsAdmin(true);
        fetchProducts();
      }

      setCheckingAuth(false);
    };

    checkAdminAccess();
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const productData = {
        name: form.name,
        price: parseFloat(form.price),
        description: form.description,
        image_url: form.image_url
      };

      let error;
      if (form.id) {
        const result = await supabase.from('products').update(productData).eq('id', form.id);
        error = result.error;
      } else {
        const result = await supabase.from('products').insert([productData]);
        error = result.error;
      }

      if (error) {
        alert("❌ שגיאה בשמירת המוצר");
        console.error(error);
        return;
      }

      setForm({ id: null, name: '', price: '', description: '', image_url: '' });
      fetchProducts();
    } catch (error) {
      alert("❌ שגיאה לא צפויה");
      console.error(error);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="text-lg font-bold text-slate-600">בודק הרשאות...</div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center" dir="rtl">
        <div className="text-center bg-white p-8 rounded-3xl shadow-lg border border-red-200">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-black text-red-600 mb-2">גישה נדחתה</h1>
          <p className="text-slate-600 mb-6">אין לך הרשאות לגשת לעמוד זה</p>
          <Link href="/" className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-blue-600 inline-block">
            חזרה לחנות
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-black text-slate-900">ניהול מלאי</h1>
          <Link href="/" className="px-4 py-2 bg-white border rounded-xl font-bold shadow-sm hover:bg-slate-50"> חזרה לחנות </Link>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border mb-8">
          <h2 className="text-xl font-bold mb-4">{form.id ? 'עריכת מוצר' : 'הוספת מוצר חדש'}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input placeholder="שם המכשיר" className="p-4 bg-slate-50 border rounded-2xl outline-none focus:border-blue-500" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
            <input placeholder="מחיר" type="number" className="p-4 bg-slate-50 border rounded-2xl outline-none focus:border-blue-500" value={form.price} onChange={e => setForm({...form, price: e.target.value})} required />
            <textarea placeholder="תיאור" className="p-4 bg-slate-50 border rounded-2xl outline-none focus:border-blue-500 md:col-span-2 h-24" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
            <button type="submit" className="md:col-span-2 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-blue-600 transition-all shadow-lg shadow-blue-100">
              {form.id ? 'עדכן מכשיר' : 'פרסם מכשיר'}
            </button>
          </form>
        </div>

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
              {products.map(p => (
                <tr key={p.id} className="border-b">
                  <td className="p-4 font-bold">{p.name}</td>
                  <td className="p-4 font-black text-blue-600">₪{p.price}</td>
                  <td className="p-4">
                    <button onClick={() => setForm(p)} className="text-blue-500 font-bold hover:underline">ערוך</button>
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