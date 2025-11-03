import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/dbConnect';
import User from '@/models/user';
import Transaction from '@/models/Transaction';

export async function GET(request) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const transaction_id = searchParams.get('transaction_id');
    const tx_ref = searchParams.get('tx_ref');
    const status = searchParams.get('status');
    const callbackUrl = searchParams.get('callbackUrl');
    const checkTrans = await Transaction.findOne({ flutterwaveTxRef: tx_ref });



    if (checkTrans.status === "successful") {
      return NextResponse.json({ error: "payment already made" }, { status: 400 })
    }

    if ((status === 'successful' || status === 'completed') && tx_ref) {
      console.log("inside line 29")
      // Verify with Flutterwave
      const verifyResponse = await fetch(
        `https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`,
        {
          headers: {
            'Authorization': `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`
          }
        }
      );


      if (verifyResponse.ok) {
        const verificationData = await verifyResponse.json();
        
        if (verificationData.data.status === 'successful') {
          const txRefParts = tx_ref.split('-');
          const userId = txRefParts[2].split('_')[0];
          const walletType = txRefParts[4];
          const amount = parseFloat(verificationData.data.amount);
          
          console.log({ userId })
          console.log({txRefParts})
          const user = await User.findById(userId);

          if (user) {
            user.status = "active"
            // const currentBalance = user.earnings[walletType + 'Wallet'] || 0;
            // user.earnings[walletType + 'Wallet'] = currentBalance + amount;
            await user.save();

          }
          
          // Update transaction
          await Transaction.findOneAndUpdate(
            { flutterwaveTxRef: tx_ref },
            {
              status: 'successful',
              paymentStatus: 'successful',
              flutterwaveId: verificationData.data.id,
              paymentMethod: verificationData.data.payment_type,
              paidAt: new Date(),
              updatedAt: new Date(),
              flutterwaveResponse: verificationData
            }
          );
          
          // Redirect to frontend success page
          return NextResponse.redirect(
            `${process.env.NEXTAUTH_URL}/wallet/verify?status=success&walletType=${walletType}&amount=${amount}&tx_ref=${tx_ref}`
          );
        }
      }
    }
    
    // If failed
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/wallet/verify?status=failed&tx_ref=${tx_ref}`
    );

  } catch (error) {
    console.error('Wallet funding verification error:', error);
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/wallet/verify?status=error&tx_ref=${tx_ref}`
    );
  }
}