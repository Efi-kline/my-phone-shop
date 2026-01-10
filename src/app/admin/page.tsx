'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// הגדרת האימייל המורשה שלך
const ADMIN_EMAIL = "efi49217@gmail.com";

export default function AdminPage() {
  const [user, setUser] = useState<any>(null);
  const [phones, setPhones] = useState<any[]>([]);
  const [form, setForm] = useState({ id: '', name: '', price: '', description: '', image_url: '' });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  useEffect(() => {
    // בדיקת משתמש ראשונית
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user?.email === ADMIN_EMAIL) fetchPhones();
    };
    getUser();

    // מאזין לשינויי התחברות (חשוב עבור ה-Redirect)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user?.email === ADMIN_EMAIL) fetchPhones();
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchPhones() {
    const { data } = await supabase.from('phones').select('*').order('created_at', { ascending: false });
    if (data) setPhones(data);
  }

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'http://localhost:3000/admin', // מחזיר אותך ישר לכאן
      },
    });
  };

  // פונקציית העלאת תמונה
  const uploadFile = async (file: File) => {
    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('phone-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('phone-images').getPublicUrl(fileName);
      setForm(prev => ({ ...prev, image_url: data.publicUrl }));
    } catch (error: any) {
      alert('שגיאה בהעלאה: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const phoneData = {
      name: form.name,
      price: parseFloat(form.price as string),
      description: form.description,
      image_url: form.image_url
    };

    if (form.id) {
      await supabase.from('phones').update(phoneData).eq('id', form.id);
    } else {
      await supabase.from('phones').insert([phoneData]);
    }
    
    setForm({ id: '', name: '', price: '', description: '', image_url: '' });
    setLoading(false);
    fetchPhones();
  };

  const handleEdit = (phone: any) => {
    setForm(phone);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (confirm('למחוק את המכשיר מהמלאי?')) {
      await supabase.from('phones').delete().eq('id', id);
      fetchPhones();
    }
  };

  // תצוגת מסך התחברות אם המשתמש אינו אדמין
  if (!user || user.email !== ADMIN_EMAIL) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6" dir="rtl">
        <div className="bg-white p-10 rounded-3xl shadow-2xl text-center max-w-sm border border-slate-100">
          <h1 className="text-3xl font-black mb-6 text-slate-800">כניסת מנהל</h1>
          <p className="text-slate-500 mb-8 font-medium">אנא התחבר עם חשבון Google המורשה כדי לנהל את החנות.</p>
          <button 
            onClick={handleGoogleLogin} 
            className="w-full bg-white border-2 border-slate-200 p-4 rounded-2xl shadow-sm flex items-center justify-center gap-3 hover:bg-slate-50 transition-all font-bold text-slate-700"
          >
            <img src="https://www.google.com/favicon.ico" className="w-5 h-5" />
            התחבר עם Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20" dir="rtl">
      {/* תפריט עליון */}
      <div className="bg-white border-b p-4 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 text-white p-2 rounded-lg font-bold">Admin</div>
            <span className="font-medium text-slate-600 hidden md:inline">{user.email}</span>
          </div>
          <div className="flex gap-4">
            <Link href="/" className="text-blue-600 font-bold hover:underline">לצפייה בחנות</Link>
            <button onClick={() => supabase.auth.signOut()} className="text-red-500 font-medium">התנתק</button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 mt-8">
        <h1 className="text-4xl font-black text-slate-800 mb-8">ניהול מלאי</h1>

        {/* טופס הוספה/עריכה */}
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl shadow-xl space-y-6 mb-12 border border-blue-100">
          <h2 className="text-xl font-bold text-blue-800">{form.id ? 'עריכת מכשיר' : 'הוספת מכשיר חדש'}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input className="p-4 bg-slate-50 border rounded-2xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="שם המכשיר" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
            <input className="p-4 bg-slate-50 border rounded-2xl outline-none focus:ring-2 focus:ring-blue-500" type="number" placeholder="מחיר" value={form.price} onChange={e => setForm({...form, price: e.target.value})} required />
          </div>

          {/* גרירת תמונה */}
          <div 
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setIsDragOver(false); if(e.dataTransfer.files[0]) uploadFile(e.dataTransfer.files[0]); }}
            className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${isDragOver ? 'border-blue-500 bg-blue-50' : 'border-slate-300'}`}
          >
            {form.image_url ? (
              <div className="flex flex-col items-center">
                <img src={form.image_url} className="h-24 w-24 object-contain rounded-lg mb-2 shadow-md bg-white p-1" />
                <button type="button" onClick={() => setForm({...form, image_url: ''})} className="text-xs text-red-500 underline">החלף תמונה</button>
              </div>
            ) : (
              <div>
                <p className="text-slate-500 mb-2">גרור תמונה לכאן או</p>
                <label className="text-blue-600 font-bold cursor-pointer">
                  בחר קובץ
                  <input type="file" className="hidden" accept="image/*" onChange={e => e.target.files && uploadFile(e.target.files[0])} />
                </label>
              </div>
            )}
            {uploading && <p className="animate-pulse text-blue-500 text-sm mt-2">מעלה תמונה...</p>}
          </div>

          <textarea className="w-full p-4 bg-slate-50 border rounded-2xl outline-none h-24" placeholder="תיאור המכשיר..." value={form.description} onChange={e => setForm({...form, description: e.target.value})} />

          <button disabled={loading || uploading || !form.image_url} className={`w-full py-4 rounded-2xl text-white font-bold text-xl transition-all ${loading || uploading || !form.image_url ? 'bg-slate-300' : 'bg-blue-600 hover:bg-blue-700 active:scale-[0.98]'}`}>
            {loading ? 'מעבד...' : form.id ? 'עדכן מכשיר' : 'פרסם מכשיר'}
          </button>
        </form>

        {/* טבלת מכשירים */}
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden border border-slate-100">
          <table className="w-full text-right">
            <thead className="bg-slate-800 text-white">
              <tr>
                <th className="p-4">מכשיר</th>
                <th className="p-4">מחיר</th>
                <th className="p-4">פעולות</th>
              </tr>
            </thead>
            <tbody>
              {phones.map(phone => (
                <tr key={phone.id} className="border-t hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-bold text-slate-800">{phone.name}</td>
                  <td className="p-4 text-blue-600 font-black text-lg">₪{phone.price}</td>
                  <td className="p-4 flex gap-2">
                    <button onClick={() => handleEdit(phone)} className="bg-amber-100 text-amber-700 px-4 py-2 rounded-xl text-sm font-bold hover:bg-amber-200">ערוך</button>
                    <button onClick={() => handleDelete(phone.id)} className="bg-red-100 text-red-700 px-4 py-2 rounded-xl text-sm font-bold hover:bg-red-200">מחק</button>
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