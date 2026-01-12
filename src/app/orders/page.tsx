'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import Navbar from '@/components/Navbar';
import { useRouter } from 'next/navigation';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image_url: string;
}

interface Order {
  id: string;
  created_at: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  delivery_address?: string;
}

export default function OrdersPage() {
  const supabase = createClient();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setOrders(data);
      }

      setLoading(false);
    };

    fetchOrders();
  }, [supabase, router]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'processing':
        return 'bg-blue-100 text-blue-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'הושלם';
      case 'processing':
        return 'בטיפול';
      case 'pending':
        return 'ממתין';
      case 'cancelled':
        return 'בוטל';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black" dir="rtl">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-[#f5e6d6] text-xl font-bold">טוען הזמנות...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black" dir="rtl">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-black text-[#c07830] mb-2">ההזמנות שלי</h1>
          <p className="text-[#f5e6d6]">
            {orders.length > 0
              ? `יש לך ${orders.length} הזמנות`
              : 'עדיין לא ביצעת הזמנות'}
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">אין הזמנות</h2>
            <p className="text-gray-600 mb-6">התחל לקנות ותראה את ההזמנות שלך כאן</p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-[#c07830] text-[#f5e6d6] rounded-xl font-bold hover:bg-[#a86828] transition-all"
            >
              התחל לקנות
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="flex justify-between items-start mb-4 border-b pb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      הזמנה #{order.id.slice(0, 8)}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleDateString('he-IL', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <div className="text-left">
                    <span
                      className={`inline-block px-4 py-2 rounded-xl font-bold text-sm ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {getStatusText(order.status)}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  {order.items.map((item, idx) => (
                    <div
                      key={`${order.id}-${idx}`}
                      className="flex items-center gap-4 bg-gray-50 rounded-xl p-3"
                    >
                      <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            📱
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900">{item.name}</h4>
                        <p className="text-sm text-gray-500">
                          כמות: {item.quantity} × ₪{item.price.toLocaleString()}
                        </p>
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-[#c07830]">
                          ₪{(item.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center pt-4 border-t">
                  <div className="text-gray-600">
                    {order.delivery_address && (
                      <p className="text-sm">כתובת: {order.delivery_address}</p>
                    )}
                  </div>
                  <div className="text-left">
                    <p className="text-sm text-gray-500 mb-1">סה"כ</p>
                    <p className="text-2xl font-black text-[#c07830]">
                      ₪{order.total.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
