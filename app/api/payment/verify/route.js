import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/dbConnect';
import User from '@/models/user';
import { authOptions } from '../../auth/options';
import { getServerSession } from 'next-auth';


export async function GET(request) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const reference = searchParams.get('reference');

    if (!reference) {
      return NextResponse.json(
        { success: false, error: 'Reference is required' },
        { status: 400 }
      );
    }

    // Verify with Paystack
    const verifyResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
        }
      }
    );

    if (!verifyResponse.ok) {
      const errorData = await verifyResponse.json();
      throw new Error(errorData.message || 'Payment verification failed');
    }

    const verificationData = await verifyResponse.json();

    if (verificationData.data.status !== 'success') {
      return NextResponse.json(
        { success: false, error: 'Payment not successful' },
        { status: 400 }
      );
    }

    // Get metadata
    const { metadata } = verificationData.data;
    const { planType, userId } = metadata;

    // Find and update user
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Activate plan
    await user.activatePlan(planType, verificationData.data.reference);

    return NextResponse.json({
      success: true,
      data: {
        planActivated: planType,
        amountPaid: verificationData.data.amount / 100,
        paymentDate: verificationData.data.paid_at,
        user: {
          id: user._id,
          username: user.username,
          email: user.email
        }
      }
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Payment verification failed' },
      { status: 500 }
    );
  }
}