import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function HomePage() {
  // שליפת הנתונים
  const { data: phones, error } = await supabase
    .from('phones')
    .select('*');

  if (error) return <div className="p-10 text-center text-red-500">שגיאה: {error.message}</div>;

  return (
    <div className="min-h-screen bg-white p-10" dir="rtl">
      <h1 className="text-4xl font-bold text-center mb-10 text-blue-900">הקטלוג המלא - מודיעין עילית</h1>
      
      {/* כאן קורה הקסם - הלולאה שעוברת על כל המכשירים */}
      <div className="flex flex-wrap justify-center gap-8">
        {phones?.map((phone) => (
          <div key={phone.id} className="w-72 border-2 border-gray-100 rounded-2xl shadow-lg p-5 flex flex-col items-center hover:border-blue-500 transition-colors">
            {/* תמונה */}
            <div className="h-48 w-full flex items-center justify-center bg-gray-50 rounded-xl mb-4">
              <img 
                src={phone.image_url || 'https://via.placeholder.com/150'} 
                alt={phone.name}
                className="max-h-full max-w-full object-contain"
              />
            </div>

            {/* פרטים */}
            <h2 className="text-xl font-bold text-gray-800 text-center">{phone.name}</h2>
            <p className="text-gray-500 text-sm text-center mt-2 flex-grow">{phone.description}</p>
            
            <div className="mt-4 w-full flex justify-between items-center bg-blue-50 p-3 rounded-lg">
              <span className="text-2xl font-black text-blue-700">₪{phone.price}</span>
              <button className="bg-blue-600 text-white px-4 py-1 rounded-md font-bold">קנה עכשיו</button>
            </div>
          </div>
        ))}
      </div>
      
      {/* הודעה אם אין מכשירים בכלל */}
      {(!phones || phones.length === 0) && (
        <p className="text-center text-gray-400 mt-20">אין מכשירים להצגה. הוסף מכשירים בדף הניהול.</p>
      )}
    </div>
  );
}