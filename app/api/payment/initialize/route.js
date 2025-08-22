import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { email, amount, planType, userId, planName } = await request.json();
    
    if (!email || !amount || !planType || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create the reference first
    const reference = `pamarel-${Date.now()}-${userId}`;
    
    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
      },
      body: JSON.stringify({
        email,
        amount: amount * 100, // Convert to kobo
        reference: reference, // Use the reference variable we created
        currency: 'NGN',
        callback_url: `${process.env.NEXTAUTH_URL}/payment/verify?reference=${reference}`, // Now reference is defined
        metadata: {
          planType,
          userId,
          planName
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