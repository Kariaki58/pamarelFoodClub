import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { email, amount, planType, userId, metadata } = await request.json();
    
    if (!email || !amount || !planType || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
      },
      body: JSON.stringify({
        email,
        amount: amount * 100, // Convert to kobo
        reference: `pamarel-${Date.now()}-${userId}`,
        currency: 'NGN',
        callback_url: `${process.env.NEXTAUTH_URL}/payment/callback`,
        metadata: {
          planType,
          userId,
          ...metadata
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to initialize payment');
    }

    const data = await response.json();
    return NextResponse.json({
      success: true,
      authorizationUrl: data.data.authorization_url,
      accessCode: data.data.access_code,
      reference: data.data.reference
    });

  } catch (error) {
    console.error('Payment initialization error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Payment initialization failed' },
      { status: 500 }
    );
  }
}