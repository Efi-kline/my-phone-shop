'use client';
import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const [profile, setProfile] = useState<any>(null);
  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        setProfile(data);
      } else {
        setProfile(null);
      }
    };
    fetchProfile();
    
    // רענון כשיש שינוי בהתחברות
    supabase.auth.onAuthStateChange(() => {
      fetchProfile();
      router.refresh();
    });
  }, [supabase, router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    window.location.href = '/'; // רענון מלא
  };

  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-white border-b sticky top-0 z-50 shadow-sm" dir="rtl">
      <Link href="/" className="text-2xl font-black text-blue-600">
        PHONE<span className="text-slate-900">SHOP</span>
      </Link>

      <div className="flex items-center gap-4">
        {/* כפתור אדמין - מופיע רק למנהל */}
        {profile?.role === 'admin' && (
          <Link href="/admin" className="px-3 py-1 bg-red-100 text-red-600 rounded-lg font-bold text-sm border border-red-200">
            🛠 ניהול חנות
          </Link>
        )}

        {profile ? (
          <div className="flex items-center gap-3">
            <Link href="/profile" className="flex items-center gap-2 text-sm font-bold text-slate-700 hover:bg-slate-50 p-2 rounded-lg border">
               👤 {profile.full_name?.split(' ')[0] || 'הפרופיל שלי'}
            </Link>
            <button onClick={handleLogout} className="text-sm text-red-500 font-medium hover:underline">התנתק</button>
          </div>
        ) : (
          <Link href="/login" className="px-6 py-2 bg-blue-600 text-white rounded-full font-bold text-sm shadow-md hover:bg-blue-700">
            התחברות
          </Link>
        )}
      </div>
    </nav>
  );
}