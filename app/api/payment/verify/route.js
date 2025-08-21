import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/dbConnect';
import User from '@/models/user';

export async function GET(request) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const reference = searchParams.get('reference');
    const trxref = searchParams.get('trxref');
    
    // Use either reference or trxref (Paystack uses both)
    const paymentReference = reference || trxref;

    // Basic validation
    if (!paymentReference) {
      return NextResponse.json(
        { success: false, error: 'Reference is required' },
        { status: 400 }
      );
    }

    // Verify payment with Paystack
    const verifyResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${paymentReference}`,
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

    // Check payment status
    if (verificationData.data.status !== 'success') {
      // Redirect to failure page if payment wasn't successful
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/payment/failed`);
    }

    // Extract metadata
    const { metadata } = verificationData.data;
    if (!metadata || !metadata.planType || !metadata.userId) {
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/payment/failed?error=invalid_metadata`);
    }

    const { planType, userId } = metadata;

    // Validate plan type
    if (!['basic', 'classic', 'deluxe'].includes(planType.toLowerCase())) {
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/payment/failed?error=invalid_plan`);
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/payment/failed?error=user_not_found`);
    }
    
    // Activate user
    user.status = 'active';
    await user.save();

    const headers = Object.fromEntries(request.headers);
    const isApiCall = headers['accept']?.includes('application/json') || 
                      headers['content-type']?.includes('application/json');

    if (isApiCall) {
      return NextResponse.json({
        success: true,
        message: 'Payment verified and user activated successfully',
        user: {
          id: user._id,
          email: user.email,
          username: user.username
        }
      });
    } else {
      // Redirect to success page for browser requests
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/payment/success?reference=${paymentReference}&userId=${userId}`);
    }

  } catch (error) {
    console.error('PAYMENT PROCESSING ERROR:', error);
    
    // Check if this is an API call or browser request
    const headers = Object.fromEntries(request.headers);
    const isApiCall = headers['accept']?.includes('application/json');

    if (isApiCall) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Payment verification failed",
          message: error.message
        },
        { status: 500 }
      );
    } else {
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/payment/failed?error=verification_failed`);
    }
  }
}