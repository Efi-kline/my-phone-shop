import { createClient } from '@/utils/supabase/server';
import Navbar from '@/components/Navbar';
import ProductGrid from '@/components/ProductGrid';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const supabase = createClient();
  const { data: products } = await supabase
    .from('phones')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen bg-black" dir="rtl">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-12">
        <header className="mb-10 text-center md:text-right">
          <h1 className="text-4xl md:text-5xl font-black text-[#c07830] mb-2">המכשירים החמים ביותר</h1>
          <p className="text-[#f5e6d6] text-lg">שדרג את החוויה שלך עם הטכנולוגיה החדשה ביותר</p>
        </header>

        <ProductGrid products={products || []} />
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