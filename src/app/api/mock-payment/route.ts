import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { cardNumber, amount, fullName } = await req.json();

    // סימולציה של עיבוד נתונים (1.5 שניות)
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // בדיקת תקינות בסיסית
    if (!cardNumber || cardNumber.length < 16) {
      return NextResponse.json(
        { success: false, message: 'מספר כרטיס לא תקין (חייב 16 ספרות)' },
        { status: 400 }
      );
    }

    // הצלחה אקראית לצורך בדיקות (90% הצלחה)
    const isSuccess = Math.random() > 0.1;

    if (isSuccess) {
      return NextResponse.json({
        success: true,
        message: 'התשלום עבר בהצלחה! המכשיר בדרך אליך.',
        transactionId: `KOSHER-${Math.floor(Math.random() * 90000)}`
      });
    } else {
      return NextResponse.json(
        { success: false, message: 'העסקה נדחתה על ידי חברת האשראי' },
        { status: 402 }
      );
    }
  } catch (error) {
    return NextResponse.json({ success: false, message: 'שגיאת שרת' }, { status: 500 });
  }
}