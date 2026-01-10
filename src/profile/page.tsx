'use client';
import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Navbar from '@/components/Navbar';

export default function ProfilePage() {
  const supabase = createClientComponentClient();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState({ full_name: '', phone: '', address: '' });

  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (data) setFormData({ 
          full_name: data.full_name || '', 
          phone: data.phone || '', 
          address: data.address || '' 
        });
      }
    };
    getData();
  }, [supabase]);

  const handleUpdate = async () => {
    setLoading(true);
    const { error } = await supabase
      .from('profiles')
      .update(formData)
      .eq('id', user.id);

    if (!error) alert("✅ הפרטים נשמרו בהצלחה!");
    else alert("❌ שגיאה בשמירה");
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50" dir="rtl">
      <Navbar />
      <div className="max-w-xl mx-auto mt-12 p-8 bg-white rounded-3xl shadow-sm border border-slate-100">
        <h1 className="text-2xl font-black mb-6 text-slate-800">הפרטים שלי</h1>
        
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-bold mb-2 text-slate-600">שם מלא</label>
            <input 
              type="text" 
              value={formData.full_name}
              onChange={(e) => setFormData({...formData, full_name: e.target.value})}
              className="w-full p-4 border rounded-xl bg-slate-50 outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold mb-2 text-slate-600">טלפון</label>
            <input 
              type="tel" 
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="w-full p-4 border rounded-xl bg-slate-50 outline-none focus:border-blue-500 transition-colors"
              placeholder="050-0000000"
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2 text-slate-600">כתובת למשלוח</label>
            <textarea 
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              className="w-full p-4 border rounded-xl bg-slate-50 h-32 outline-none focus:border-blue-500 transition-colors"
              placeholder="רחוב, מספר בית, עיר..."
            />
          </div>

          <button 
            onClick={handleUpdate}
            disabled={loading}
            className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-blue-600 transition-all shadow-lg shadow-blue-100"
          >
            {loading ? 'שומר שינויים...' : 'שמור פרטים'}
          </button>
        </div>
      </div>
    </div>
  );
}