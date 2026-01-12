'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import Navbar from '@/components/Navbar';

export default function ProfilePage() {
  const supabase = createClient();
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
    if (!user) {
      alert("❌ אין משתמש מחובר");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update(formData)
        .eq('id', user.id);

      if (error) {
        alert("❌ שגיאה בשמירה");
        console.error(error);
      } else {
        alert("✅ הפרטים נשמרו בהצלחה!");
      }
    } catch (error) {
      alert("❌ שגיאה לא צפויה");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black" dir="rtl">
      <Navbar />
      <div className="max-w-xl mx-auto mt-12 p-8 bg-white rounded-2xl shadow-lg">
        <h1 className="text-2xl font-black mb-6 text-[#c07830]">הפרטים שלי</h1>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-bold mb-2 text-gray-700">שם מלא</label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              className="w-full p-4 border-2 border-gray-200 rounded-xl bg-gray-50 outline-none focus:border-[#c07830] transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2 text-gray-700">טלפון</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full p-4 border-2 border-gray-200 rounded-xl bg-gray-50 outline-none focus:border-[#c07830] transition-colors"
              placeholder="050-0000000"
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2 text-gray-700">כתובת למשלוח</label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full p-4 border-2 border-gray-200 rounded-xl bg-gray-50 h-32 outline-none focus:border-[#c07830] transition-colors"
              placeholder="רחוב, מספר בית, עיר..."
            />
          </div>

          <button
            onClick={handleUpdate}
            disabled={loading}
            className="w-full py-4 bg-[#c07830] text-[#f5e6d6] font-bold rounded-xl hover:bg-[#a86828] transition-all shadow-lg disabled:opacity-50"
          >
            {loading ? 'שומר שינויים...' : 'שמור פרטים'}
          </button>
        </div>
      </div>
    </div>
  );
}