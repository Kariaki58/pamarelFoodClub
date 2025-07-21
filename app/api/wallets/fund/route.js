import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/options';
// import { authOptions } from '@/lib/authOptions';
import { NextResponse } from 'next/server';
import User from '@/models/user';
import connectToDatabase from '@/lib/dbConnect';

export async function POST(req) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const { amount, walletType, callbackUrl } = await req.json();


    // Validate amount
    if (!amount || isNaN(amount) || amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid amount. Must be a positive number' },
        { status: 400 }
      );
    }

    // Validate wallet type
    const validWalletTypes = ['cash', 'gadget', 'food'];
    if (!validWalletTypes.includes(walletType)) {
      return NextResponse.json(
        { success: false, error: 'Invalid wallet type' },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Generate reference
    const reference = `FUND-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    // Call Paystack initialize endpoint
    const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: user.email,
        amount: amount * 100, // Convert to kobo
        reference,
        callback_url: `${process.env.NEXTAUTH_URL}/wallet/verify?callbackUrl=${callbackUrl}`,
        metadata: {
          walletType,
          userId: user._id.toString(),
        }
      })
    });

    const paystackData = await paystackResponse.json();

    if (!paystackResponse.ok || !paystackData.status) {
      return NextResponse.json(
        {
          success: false,
          error: paystackData.message || 'Failed to initialize payment'
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Payment initialized successfully',
      paymentUrl: paystackData.data.authorization_url,
      reference,
    });

  } catch (error) {
    console.error('Paystack funding error:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}