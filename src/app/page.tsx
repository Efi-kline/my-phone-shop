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
    <div className="min-h-screen bg-slate-50" dir="rtl">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-6 py-12">
        <header className="mb-10 text-center md:text-right">
          <h1 className="text-4xl font-black text-slate-900 mb-2">המכשירים החמים</h1>
          <p className="text-slate-500 text-lg">שדרג את החוויה שלך עם הטכנולוגיה החדשה ביותר</p>
        </header>

        {loading ? (
          <div className="text-center py-20 text-slate-400">טוען מוצרים...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 hover:shadow-xl transition-all group">
                <div className="aspect-square bg-slate-50 rounded-2xl mb-4 overflow-hidden relative">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">אין תמונה</div>
                  )}
                </div>
                <h3 className="font-bold text-lg text-slate-900 mb-1">{product.name}</h3>
                <p className="text-sm text-slate-500 mb-4 h-10 overflow-hidden">{product.description}</p>
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-blue-600 font-black text-xl">₪{product.price}</span>
                  <button 
                    onClick={() => addToCart(product)}
                    className="px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-blue-600 transition-colors shadow-lg shadow-blue-100"
                  >
                    + הוסף לסל
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}