'use client';

import { createClient } from '@/utils/supabase/client';
import Image from 'next/image';

interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    image_url: string;
}

export default function ProductGrid({ products }: { products: Product[] }) {
    const supabase = createClient();

    const addToCart = async (product: Product) => {
        try {
            const { data: { user }, error: userError } = await supabase.auth.getUser();

            if (userError || !user) {
                alert("🔒 עליך להתחבר כדי להוסיף מוצרים לסל");
                return;
            }

            // שימוש ב-RPC או שאילתה חכמה יותר מומלץ, אבל נתקן את הקיים להיות בטוח יותר
            // נשתמש ב-rpc אם אפשר, אבל כאן נתקן את הלוגיקה הקיימת:
            // קודם כל נביא את העגלה הנוכחית בצורה נקייה

            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('cart')
                .eq('id', user.id)
                .single();

            if (profileError) {
                alert("❌ שגיאה בטעינת הסל - ייתכן שהפרופיל לא קיים");
                console.error(profileError);
                return;
            }

            const currentCart = profile?.cart || [];

            // בדיקה אם המוצר כבר קיים בעגלה
            const existingItemIndex = currentCart.findIndex((item: any) => item.id === product.id);

            let updatedCart;
            if (existingItemIndex >= 0) {
                // אם המוצר קיים, הגדל את הכמות
                updatedCart = [...currentCart];
                updatedCart[existingItemIndex] = {
                    ...updatedCart[existingItemIndex],
                    quantity: (updatedCart[existingItemIndex].quantity || 1) + 1
                };
            } else {
                // אם המוצר חדש, הוסף אותו עם כמות 1
                updatedCart = [...currentCart, { ...product, quantity: 1 }];
            }

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

    if (products.length === 0) {
        return (
            <div className="text-center py-20 bg-white rounded-2xl">
                <div className="text-6xl mb-4">📱</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">אין מוצרים להצגה</h2>
                <p className="text-gray-600">המוצרים יתווספו בקרוב!</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product) => (
                <div key={product.id} className="bg-white rounded-2xl p-5 shadow-lg hover:shadow-2xl transition-all duration-400 group border border-gray-100">
                    <div className="aspect-square bg-gray-50 rounded-xl mb-4 overflow-hidden relative">
                        {product.image_url ? (
                            <div className="relative w-full h-full">
                                <Image
                                    src={product.image_url}
                                    alt={product.name}
                                    fill
                                    className="object-cover group-hover:scale-110 transition-transform duration-1000"
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                />
                            </div>
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
    );
}
