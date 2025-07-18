import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/options';
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/dbConnect';
import User from '@/models/user';

export async function GET(req) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const reference = req.nextUrl.searchParams.get('reference');

  if (!reference) {
    return NextResponse.json(
      { success: false, error: 'Missing reference' },
      { status: 400 }
    );
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
          'Content-Type': 'application/json'
        }
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
      const amount = paymentData.amount / 100;
      const { walletType, userId } = paymentData.metadata;

      // Verify the user matches the session
      if (userId !== session.user.id) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized transaction' },
          { status: 403 }
        );
      }

      // Update user's wallet
      const user = await User.findById(userId);
      if (!user) {
        return NextResponse.json(
          { success: false, error: 'User not found' },
          { status: 404 }
        );
      }

      // Update the specific wallet
      user.wallets[walletType] += amount;
      await user.save();

      return NextResponse.json({
        success: true,
        amount,
        walletType,
        newBalance: user.wallets[walletType],
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