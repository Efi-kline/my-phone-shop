'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';

export default function AdminPage() {
  const supabase = createClientComponentClient();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
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
    fetchProducts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const productData = {
      name: form.name,
      price: parseFloat(form.price),
      description: form.description,
      image_url: form.image_url
    };

    if (form.id) {
      await supabase.from('products').update(productData).eq('id', form.id);
    } else {
      await supabase.from('products').insert([productData]);
    }

    setForm({ id: null, name: '', price: '', description: '', image_url: '' });
    fetchProducts();
  };

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