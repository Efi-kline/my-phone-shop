'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import Navbar from '@/components/Navbar';
import { useRouter } from 'next/navigation';

interface CartItem {
  id: string;
  name: string;
  price: number;
  description: string;
  image_url: string;
  quantity: number;
}

export default function CartPage() {
  const supabase = createClient();
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState('');

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

  const updateQuantity = async (index: number, newQuantity: number) => {
    if (!userId || newQuantity < 1) return;

    const updatedCart = [...cart];
    updatedCart[index] = { ...updatedCart[index], quantity: newQuantity };
    setCart(updatedCart);

    const { error } = await supabase
      .from('profiles')
      .update({ cart: updatedCart })
      .eq('id', userId);

    if (error) {
      console.error('שגיאה בעדכון כמות:', error);
    }
  };

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
    return cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
  };

  const getTotalItems = () => {
    return cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  };

  const getFinalPrice = () => {
    const subtotal = getTotalPrice();
    return subtotal - discount;
  };

  const applyCoupon = async () => {
    const code = couponCode.toUpperCase().trim();

    // קופונים לדוגמה
    const coupons: { [key: string]: { discount: number; type: 'percent' | 'fixed' } } = {
      'WELCOME10': { discount: 10, type: 'percent' },
      'SAVE50': { discount: 50, type: 'fixed' },
      'SPECIAL20': { discount: 20, type: 'percent' },
      'FREEDEAL': { discount: 100, type: 'fixed' },
    };

    if (!code) {
      setCouponMessage('❌ אנא הזן קוד קופון');
      return;
    }

    const coupon = coupons[code];

    if (coupon) {
      const subtotal = getTotalPrice();
      let discountAmount = 0;

      if (coupon.type === 'percent') {
        discountAmount = Math.round((subtotal * coupon.discount) / 100);
        setCouponMessage(`✅ קופון הוחל! ${coupon.discount}% הנחה`);
      } else {
        discountAmount = coupon.discount;
        setCouponMessage(`✅ קופון הוחל! ₪${coupon.discount} הנחה`);
      }

      setDiscount(discountAmount);
    } else {
      setCouponMessage('❌ קוד קופון לא תקין');
      setDiscount(0);
    }
  };

  const removeCoupon = () => {
    setDiscount(0);
    setCouponCode('');
    setCouponMessage('');
  };

  const handleCheckout = async () => {
    if (!userId || cart.length === 0) return;

    // יצירת הזמנה חדשה
    const orderData = {
      user_id: userId,
      items: cart,
      total: getFinalPrice(),
      status: 'pending',
      coupon_code: discount > 0 ? couponCode : null,
      discount_amount: discount,
    };

    const { data, error } = await supabase
      .from('orders')
      .insert([orderData])
      .select();

    if (error) {
      console.error('שגיאה ביצירת הזמנה:', error);
      alert('❌ שגיאה בביצוע ההזמנה');
      return;
    }

    // ריקון העגלה אחרי הזמנה מוצלחת
    await clearCart();

    alert('✅ ההזמנה בוצעה בהצלחה! ניתן לראות אותה בדף "ההזמנות שלי"');
    router.push('/orders');
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
              ? `יש לך ${getTotalItems()} פריטים בסל (${cart.length} מוצרים שונים)`
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
                    <div className="flex items-center gap-2 mt-2">
                      <p className="text-[#c07830] font-black text-xl">
                        ₪{item.price.toLocaleString()}
                      </p>
                      <span className="text-gray-400 text-sm">× {item.quantity || 1}</span>
                      <p className="text-gray-700 font-bold text-lg mr-2">
                        = ₪{(item.price * (item.quantity || 1)).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 bg-gray-100 rounded-xl p-1">
                      <button
                        onClick={() => updateQuantity(index, (item.quantity || 1) - 1)}
                        disabled={(item.quantity || 1) <= 1}
                        className="w-8 h-8 bg-white rounded-lg font-bold text-gray-700 hover:bg-gray-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        -
                      </button>
                      <span className="w-12 text-center font-bold text-gray-900">
                        {item.quantity || 1}
                      </span>
                      <button
                        onClick={() => updateQuantity(index, (item.quantity || 1) + 1)}
                        className="w-8 h-8 bg-white rounded-lg font-bold text-gray-700 hover:bg-gray-200 transition-colors"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromCart(index)}
                      className="px-4 py-2 bg-red-100 text-red-600 rounded-xl font-bold hover:bg-red-200 transition-colors text-sm"
                    >
                      הסר
                    </button>
                  </div>
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

                {/* קופון הנחה */}
                <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                  <label className="block text-sm font-bold mb-2 text-gray-700">
                    יש לך קופון?
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="הזן קוד קופון"
                      className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg outline-none focus:border-[#c07830] transition-colors text-sm"
                      disabled={discount > 0}
                    />
                    {discount > 0 ? (
                      <button
                        onClick={removeCoupon}
                        className="px-4 py-2 bg-red-100 text-red-600 rounded-lg font-bold hover:bg-red-200 transition-colors text-sm"
                      >
                        הסר
                      </button>
                    ) : (
                      <button
                        onClick={applyCoupon}
                        className="px-4 py-2 bg-[#c07830] text-[#f5e6d6] rounded-lg font-bold hover:bg-[#a86828] transition-colors text-sm"
                      >
                        החל
                      </button>
                    )}
                  </div>
                  {couponMessage && (
                    <p className={`text-xs mt-2 font-bold ${couponMessage.includes('✅') ? 'text-green-600' : 'text-red-600'}`}>
                      {couponMessage}
                    </p>
                  )}
                  <div className="mt-2 text-xs text-gray-500">
                    <p className="font-bold mb-1">קופונים זמינים:</p>
                    <p>WELCOME10 - 10% הנחה</p>
                    <p>SAVE50 - ₪50 הנחה</p>
                    <p>SPECIAL20 - 20% הנחה</p>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-700">
                    <span>פריטים ({getTotalItems()})</span>
                    <span className="font-bold">₪{getTotalPrice().toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>משלוח</span>
                    <span className="font-bold text-green-600">חינם</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600 bg-green-50 px-2 py-1 rounded">
                      <span className="font-bold">הנחה</span>
                      <span className="font-bold">-₪{discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="border-t pt-3 flex justify-between text-xl font-black">
                    <span>סה"כ לתשלום</span>
                    <span className="text-[#c07830]">
                      ₪{getFinalPrice().toLocaleString()}
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
