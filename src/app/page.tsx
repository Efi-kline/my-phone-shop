'use client';
import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/auth-helpers-nextjs';
import Navbar from '@/components/Navbar';

export default function HomePage() {
  const [supabase] = useState(() =>
    createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  );
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (data) setProducts(data);
      setLoading(false);
    };
    fetchProducts();
  }, [supabase]);

  const addToCart = async (product: any) => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        alert("🔒 עליך להתחבר כדי להוסיף מוצרים לסל");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('cart')
        .eq('id', user.id)
        .single();

      if (profileError) {
        alert("❌ שגיאה בטעינת הסל");
        console.error(profileError);
        return;
      }

      const currentCart = profile?.cart || [];
      const updatedCart = [...currentCart, product];

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ cart: updatedCart })
        .eq('id', user.id);

      if (updateError) {
        alert("❌ שגיאה בהוספה לסל");
        console.error(updateError);
        return;
      }

      alert(`🛒 ${product.name} נוסף לסל בהצלחה!`);
    } catch (error) {
      alert("❌ שגיאה לא צפויה");
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-black" dir="rtl">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-12">
        <header className="mb-10 text-center md:text-right">
          <h1 className="text-4xl md:text-5xl font-black text-[#c07830] mb-2">המכשירים החמים ביותר</h1>
          <p className="text-[#f5e6d6] text-lg">שדרג את החוויה שלך עם הטכנולוגיה החדשה ביותר</p>
        </header>

        {loading ? (
          <div className="text-center py-20 text-[#f5e6d6]">טוען מוצרים...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-2xl p-5 shadow-lg hover:shadow-2xl transition-all duration-400 group border border-gray-100">
                <div className="aspect-square bg-gray-50 rounded-xl mb-4 overflow-hidden relative">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-4xl">📱</div>
                  )}
                </div>
                <h3 className="font-bold text-lg text-gray-900 mb-1">{product.name}</h3>
                <p className="text-sm text-gray-500 mb-4 h-10 overflow-hidden">{product.description}</p>
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-[#c07830] font-black text-xl">₪{product.price.toLocaleString()}</span>
                  <button
                    onClick={() => addToCart(product)}
                    className="px-4 py-2 bg-[#c07830] text-[#f5e6d6] rounded-xl text-sm font-bold hover:bg-[#a86828] transition-all duration-400 shadow-lg"
                  >
                    + הוסף לסל
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-black border-t border-[#c07830] mt-20 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-[#f5e6d6] text-sm">
            נקודת שיווק - בני ברק © {new Date().getFullYear()} | כל הזכויות שמורות
          </p>
        </div>
      </footer>
    </div>
  );
}