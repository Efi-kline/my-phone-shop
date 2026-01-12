'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const [profile, setProfile] = useState<any>(null);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      console.log('🔍 Navbar: מנסה לטעון פרופיל...');
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      console.log('👤 Navbar: משתמש מחובר?', user?.email, 'שגיאה?', userError);

      if (user) {
        const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        console.log('📋 Navbar: פרופיל נטען:', data, 'שגיאה?', error);
        setProfile(data);
      } else {
        setProfile(null);
      }
    };
    fetchProfile();

    // רענון כשיש שינוי בהתחברות
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);

      if (event === 'SIGNED_IN' && session?.user) {
        // טען את הפרופיל מיד אחרי התחברות
        const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
        setProfile(data);
        router.refresh();
      } else if (event === 'SIGNED_OUT') {
        setProfile(null);
        router.refresh();
      } else if (event === 'INITIAL_SESSION') {
        // בטעינה ראשונית לא עושים כלום, זה מטופל ב-fetchProfile
      }
    });

    // ניקוי ה-subscription כשהקומפוננטה נהרסת
    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    window.location.href = '/'; // רענון מלא
  };

  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-black border-b border-[#c07830] sticky top-0 z-50 shadow-lg" dir="rtl">
      <Link href="/" className="text-2xl font-black text-[#c07830]">
        נקודת שיווק <span className="text-[#f5e6d6] text-base font-normal">בני ברק</span>
      </Link>

      <div className="flex items-center gap-4">
        {/* כפתור אדמין - מופיע רק למנהל */}
        {profile?.role === 'admin' && (
          <Link href="/admin" className="px-4 py-2 bg-[#c07830] text-[#f5e6d6] rounded-lg font-bold text-sm hover:bg-[#a86828] transition-all">
            🛠 ניהול חנות
          </Link>
        )}

        {/* כפתור ההזמנות שלי */}
        {profile && (
          <Link href="/orders" className="px-4 py-2 bg-[#c07830] text-[#f5e6d6] rounded-lg font-bold text-sm hover:bg-[#a86828] transition-all">
            📦 ההזמנות שלי
          </Link>
        )}

        {/* כפתור סל קניות */}
        {profile && (
          <Link href="/cart" className="relative px-4 py-2 bg-[#c07830] text-[#f5e6d6] rounded-lg font-bold text-sm hover:bg-[#a86828] transition-all">
            🛒 סל קניות
            {profile.cart && profile.cart.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {profile.cart.length}
              </span>
            )}
          </Link>
        )}

        {profile ? (
          <div className="flex items-center gap-3">
            <Link href="/profile" className="flex items-center gap-2 text-sm font-bold text-[#f5e6d6] hover:text-[#c07830] transition-colors px-3 py-2 rounded-lg">
              👤 {profile.full_name?.split(' ')[0] || 'הפרופיל שלי'}
            </Link>
            <button onClick={handleLogout} className="text-sm text-[#f5e6d6] font-medium hover:text-red-400 transition-colors">התנתק</button>
          </div>
        ) : (
          <Link href="/login" className="px-6 py-2 bg-[#c07830] text-[#f5e6d6] rounded-lg font-bold text-sm shadow-md hover:bg-[#a86828] transition-all">
            התחברות
          </Link>
        )}
      </div>
    </nav>
  );
}