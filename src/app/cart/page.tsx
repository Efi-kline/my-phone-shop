'use client';
import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/auth-helpers-nextjs';
import Navbar from '@/components/Navbar';
import { useRouter } from 'next/navigation';

interface CartItem {
  id: string;
  name: string;
  price: number;
  description: string;
  image_url: string;
}

export default function CartPage() {
  const [supabase] = useState(() =>
    createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  );
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchCart = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      setUserId(user.id);

      const { data: profile } = await supabase
        .from('profiles')
        .select('cart')
        .eq('id', user.id)
        .single();

      if (profile?.cart) {
        setCart(profile.cart);
      }

      setLoading(false);
    };

    fetchCart();
  }, [supabase, router]);

  const removeFromCart = async (index: number) => {
    if (!userId) return;

    const updatedCart = cart.filter((_, i) => i !== index);
    setCart(updatedCart);

    const { error } = await supabase
      .from('profiles')
      .update({ cart: updatedCart })
      .eq('id', userId);

    if (error) {
      alert('❌ שגיאה בהסרת המוצר');
      console.error(error);
    } else {
      alert('🗑️ המוצר הוסר מהסל');
    }
  };

  const clearCart = async () => {
    if (!userId) return;

    if (!confirm('האם אתה בטוח שברצונך לרוקן את הסל?')) return;

    setCart([]);

    const { error } = await supabase
      .from('profiles')
      .update({ cart: [] })
      .eq('id', userId);

    if (error) {
      alert('❌ שגיאה בריקון הסל');
      console.error(error);
    } else {
      alert('🗑️ הסל רוקן בהצלחה');
    }
  };

  const getTotalPrice = () => {
    return cart.reduce((sum, item) => sum + item.price, 0);
  };

  const handleCheckout = async () => {
    alert('🚀 פונקציית תשלום תתווסף בקרוב!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black" dir="rtl">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-[#f5e6d6] text-xl font-bold">טוען סל קניות...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black" dir="rtl">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-black text-[#c07830] mb-2">סל הקניות שלי</h1>
          <p className="text-[#f5e6d6]">
            {cart.length > 0
              ? `יש לך ${cart.length} פריטים בסל`
              : 'הסל שלך ריק'}
          </p>
        </div>

        {cart.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl">
            <div className="text-6xl mb-4">🛒</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">הסל שלך ריק</h2>
            <p className="text-gray-600 mb-6">הוסף מוצרים כדי להתחיל לקנות</p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-[#c07830] text-[#f5e6d6] rounded-xl font-bold hover:bg-[#a86828] transition-all"
            >
              התחל לקנות
            </button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* רשימת מוצרים */}
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item, index) => (
                <div
                  key={`${item.id}-${index}`}
                  className="bg-white rounded-2xl p-4 flex gap-4 items-center shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="w-24 h-24 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        📱
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-900">{item.name}</h3>
                    <p className="text-sm text-gray-500 line-clamp-1">
                      {item.description}
                    </p>
                    <p className="text-[#c07830] font-black text-xl mt-1">
                      ₪{item.price.toLocaleString()}
                    </p>
                  </div>

                  <button
                    onClick={() => removeFromCart(index)}
                    className="px-4 py-2 bg-red-100 text-red-600 rounded-xl font-bold hover:bg-red-200 transition-colors"
                  >
                    הסר
                  </button>
                </div>
              ))}

              <button
                onClick={clearCart}
                className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
              >
                🗑️ רוקן את הסל
              </button>
            </div>

            {/* סיכום הזמנה */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl p-6 shadow-xl sticky top-24">
                <h2 className="text-2xl font-black text-gray-900 mb-6">
                  סיכום הזמנה
                </h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-700">
                    <span>מוצרים ({cart.length})</span>
                    <span className="font-bold">₪{getTotalPrice().toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>משלוח</span>
                    <span className="font-bold text-green-600">חינם</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between text-xl font-black">
                    <span>סה"כ</span>
                    <span className="text-[#c07830]">
                      ₪{getTotalPrice().toLocaleString()}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full py-4 bg-[#c07830] text-[#f5e6d6] rounded-xl font-bold hover:bg-[#a86828] transition-all shadow-lg mb-3"
                >
                  המשך לתשלום
                </button>

                <button
                  onClick={() => router.push('/')}
                  className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                >
                  המשך בקניות
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
