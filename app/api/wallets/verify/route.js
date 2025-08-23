import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/options';
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/dbConnect';
import User from '@/models/user';

export async function GET(req) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const reference = req.nextUrl.searchParams.get('reference');

  if (!reference) {
    return NextResponse.json({ success: false, error: 'Missing reference' }, { status: 400 });
  }

  try {
    await connectToDatabase();

    // Verify payment with Paystack
    const paystackVerify = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const result = await paystackVerify.json();

    if (!result.status) {
      return NextResponse.json(
        { success: false, error: result.message || 'Verification failed' },
        { status: 400 }
      );
    }

    const paymentData = result.data;

    if (paymentData.status === 'success') {
      const amount = paymentData.amount / 100; // kobo → naira
      const { userId } = paymentData.metadata || {};

      // Verify user matches session
      if (userId !== session.user.id) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized transaction' },
          { status: 403 }
        );
      }

      // Find user
      const user = await User.findById(userId);
      if (!user) {
        return NextResponse.json(
          { success: false, error: 'User not found' },
          { status: 404 }
        );
      }

      // Update cash wallet only
      user.earnings.cashWallet = (user.earnings.cashWallet || 0) + amount;
      await user.save();

      return NextResponse.json({
        success: true,
        amount,
        walletType: 'cashWallet',
        newBalance: user.earnings.cashWallet,
        reference,
      });
    } else {
      return NextResponse.json(
        { success: false, error: paymentData.status },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Paystack verify error:', error);
    return NextResponse.json(
      { success: false, error: 'Something went wrong' },
      { status: 500 }
    );
  }
}
