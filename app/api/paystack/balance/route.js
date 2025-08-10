import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/options';


export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Replace with actual Paystack API call
    const paystackResponse = await fetch('https://api.paystack.co/balance', {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
      }
    });

    if (!paystackResponse.ok) {
      throw new Error('Failed to fetch Paystack balance');
    }

    const paystackData = await paystackResponse.json();
    
    return NextResponse.json({
      balance: paystackData.data[0].balance / 100, // Convert from kobo to Naira
      growthRate: 4.5 // This should be calculated based on historical data
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch balance' },
      { status: 500 }
    );
  }
}