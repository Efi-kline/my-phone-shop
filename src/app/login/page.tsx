'use client';
import { useState } from 'react';
import { createBrowserClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [supabase] = useState(() =>
    createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  );
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
  });

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        // התחברות
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) {
          alert('❌ שגיאה בהתחברות: ' + error.message);
          setLoading(false);
          return;
        }

        if (data.user) {
          // בדיקה אם המשתמש הוא אדמין
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', data.user.id)
            .single();

          if (profile?.role === 'admin') {
            router.push('/admin');
          } else {
            router.push('/');
          }
        }
      } else {
        // רישום
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.fullName,
            },
          },
        });

        if (error) {
          alert('❌ שגיאה ברישום: ' + error.message);
          setLoading(false);
          return;
        }

        if (data.user) {
          // יצירת פרופיל למשתמש חדש
          const { error: profileError } = await supabase.from('profiles').insert([
            {
              id: data.user.id,
              full_name: formData.fullName,
              email: formData.email,
              role: 'user',
              cart: [],
            },
          ]);

          if (profileError) {
            console.error('שגיאה ביצירת פרופיל:', profileError);
          }

          alert('✅ נרשמת בהצלחה! כעת תוכל להתחבר');
          setIsLogin(true);
          setFormData({ email: '', password: '', fullName: '' });
        }
      }
    } catch (error) {
      console.error(error);
      alert('❌ שגיאה לא צפויה');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-md">
        {/* לוגו */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-4xl font-black text-[#c07830] mb-2">נקודת שיווק</h1>
            <p className="text-[#f5e6d6] text-sm">בני ברק</p>
          </Link>
        </div>

        {/* כרטיס התחברות */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 rounded-xl font-bold transition-all ${
                isLogin
                  ? 'bg-[#c07830] text-[#f5e6d6]'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              התחברות
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 rounded-xl font-bold transition-all ${
                !isLogin
                  ? 'bg-[#c07830] text-[#f5e6d6]'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              רישום
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700">
                  שם מלא
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  className="w-full p-3 border-2 border-gray-200 rounded-xl outline-none focus:border-[#c07830] transition-colors"
                  placeholder="הכנס את שמך המלא"
                  required={!isLogin}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-bold mb-2 text-gray-700">
                אימייל
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full p-3 border-2 border-gray-200 rounded-xl outline-none focus:border-[#c07830] transition-colors"
                placeholder="example@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2 text-gray-700">
                סיסמה
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full p-3 border-2 border-gray-200 rounded-xl outline-none focus:border-[#c07830] transition-colors"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#c07830] text-[#f5e6d6] rounded-xl font-bold hover:bg-[#a86828] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? 'מעבד...' : isLogin ? 'התחבר' : 'הירשם'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-sm text-gray-600 hover:text-[#c07830] transition-colors"
            >
              חזרה לדף הראשי
            </Link>
          </div>
        </div>

        <p className="text-center text-gray-500 text-xs mt-6">
          נקודת שיווק - בני ברק © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
