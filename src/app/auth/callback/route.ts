import { createServerClient } from '@supabase/auth-helpers-nextjs';
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
              cookieStore.set(name, value, options)
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
        const { data: existingProfile, error: profileCheckError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', data.user.id)
          .single();

        // אם אין פרופיל, צור אחד חדש
        if (!existingProfile && !profileCheckError) {
          await supabase.from('profiles').insert([
            {
              id: data.user.id,
              full_name: data.user.user_metadata.full_name || data.user.user_metadata.name || '',
              email: data.user.email,
              role: 'user',
              cart: [],
            },
          ]);
        }

        // המתן קצר כדי לוודא שהפרופיל נשמר
        await new Promise(resolve => setTimeout(resolve, 100));

        // בדיקה אם המשתמש הוא אדמין
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();

        if (profile?.role === 'admin') {
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