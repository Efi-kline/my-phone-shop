import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options as CookieOptions)
            );
          },
        },
      }
    );

    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error('שגיאה ב-callback:', error);
        return NextResponse.redirect(requestUrl.origin);
      }

      // בדיקה אם המשתמש קיים בטבלת profiles
      if (data.user) {
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', data.user.id)
          .maybeSingle();

        // אם אין פרופיל, צור אחד חדש
        if (!existingProfile) {
          console.log('יצירת פרופיל חדש למשתמש:', data.user.email);
          const { error: insertError } = await supabase.from('profiles').insert([
            {
              id: data.user.id,
              full_name: data.user.user_metadata.full_name || data.user.user_metadata.name || '',
              email: data.user.email,
              role: 'user',
              cart: [],
            },
          ]);

          if (insertError) {
            console.error('שגיאה ביצירת פרופיל:', insertError);
          }
        }

        // המתן קצר כדי לוודא שהפרופיל נשמר
        await new Promise(resolve => setTimeout(resolve, 200));

        // בדיקה אם המשתמש הוא אדמין
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .maybeSingle();

        console.log('פרופיל משתמש:', profile);

        if (profile?.role === 'admin') {
          console.log('מעביר לדף אדמין');
          return NextResponse.redirect(`${requestUrl.origin}/admin`);
        }
      }
    } catch (error) {
      console.error('שגיאה לא צפויה ב-callback:', error);
    }
  }

  // חזרה לדף הבית אחרי התחברות מוצלחת
  return NextResponse.redirect(requestUrl.origin);
}