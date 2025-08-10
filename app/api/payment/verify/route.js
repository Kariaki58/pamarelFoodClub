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

    // Basic validation
    if (!reference) {
      return NextResponse.json(
        { success: false, error: 'Reference is required' },
        { status: 400 }
      );
    }

    // Verify payment with Paystack
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

    // Check payment status
    if (verificationData.data.status !== 'success') {
      return NextResponse.json(
        { success: false, error: 'Payment not successful' },
        { status: 400 }
      );
    }

    // Extract metadata
    const { metadata } = verificationData.data;
    if (!metadata || !metadata.planType || !metadata.userId) {
      return NextResponse.json(
        { success: false, error: 'Invalid payment metadata' },
        { status: 400 }
      );
    }

    const { planType, userId } = metadata;

    // Validate plan type
    if (!['basic', 'classic', 'deluxe'].includes(planType.toLowerCase())) {
      return NextResponse.json(
        { success: false, error: 'Invalid plan type' },
        { status: 400 }
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

    // Check for existing plan
    if (user.currentPlan) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'User already has an active plan',
          currentPlan: user.currentPlan
        },
        { status: 400 }
      );
    }

    // Activate plan
    await user.activatePlan(planType, verificationData.data.reference);

    // Record transaction
    user.transactions.push({
      type: 'deposit',
      amount: verificationData.data.amount / 100,
      walletType: 'cash',
      plan: planType,
      description: `Plan activation payment`,
      reference: verificationData.data.reference,
      status: 'completed',
      date: new Date(verificationData.data.paid_at)
    });

    // =============================================
    // CRITICAL: 7×7 MATRIX TRACKING (UNOPTIMIZED)
    // =============================================
    if (user.referredBy) {
      const referrer = await User.findById(user.referredBy);
      if (referrer) {
        // 1. Update direct referrals
        await referrer.processActivatedReferral(user._id, planType);

        // 2. Recursively update ALL uplines
        let currentUpline = referrer;
        let levelsProcessed = 0;
        const MAX_LEVELS = 7;
        
        while (currentUpline && levelsProcessed < MAX_LEVELS) {
          const board = currentUpline.boardProgress.find(
            b => b.boardType === currentUpline.currentBoard
          );
          
          if (board) {
            // Add the new indirect referral
            board.indirectReferrals.push({
              userId: user._id,
              countedForBoard: currentUpline.currentBoard,
              level: levelsProcessed + 1,
              timestamp: new Date()
            });

            // ===== ADD THIS CHECK RIGHT AFTER UPDATING REFERRALS =====
            if (!board.completed) {
              const meetsDirect = board.directReferrals.length >= 7;
              const meetsIndirect = board.indirectReferrals.length >= 49;
              
              if (meetsDirect && meetsIndirect) {
                board.completed = true;
                board.completionDate = new Date();
                await currentUpline.processBoardCompletion(); // Handle rewards
              }
            }
            // ===== END OF ADDED CODE =====

            await currentUpline.save();
          }
          
          currentUpline = await User.findById(currentUpline.referredBy);
          levelsProcessed++;
        }
      }
    }

    await user.save();

    // =============================================
    // RESPONSE WITH WARNINGS
    // =============================================
    return NextResponse.json({
      success: true,
      warnings: [
        "SYSTEM NOT OPTIMIZED FOR SCALE",
        "Will crash when referral network exceeds 10,000 users",
        "No protection against duplicate referrals",
        "Document size limits will be exceeded"
      ],
      data: {
        planActivated: planType,
        amountPaid: verificationData.data.amount / 100,
        paymentDate: verificationData.data.paid_at,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          currentBoard: user.currentBoard,
          referralCode: user.referralCode,
          directReferrals: user.boardProgress
            .find(b => b.boardType === user.currentBoard)?.directReferrals.length || 0,
          indirectReferrals: user.boardProgress
            .find(b => b.boardType === user.currentBoard)?.indirectReferrals.length || 0
        },
        matrixProgress: {
          currentDepth: user.boardProgress
            .find(b => b.boardType === user.currentBoard)?.indirectReferrals.length || 0,
          nextMilestone: user.currentBoard === 'bronze' 
            ? '7 direct referrals for Silver' 
            : user.currentBoard === 'silver'
              ? '49 indirect referrals for Gold'
              : user.currentBoard === 'gold'
                ? '343 indirect referrals for Platinum'
                : 'Exit board requirements'
        }
      }
    });

  } catch (error) {
    console.error('PAYMENT PROCESSING ERROR:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Payment completed but referral tracking failed",
        systemWarning: "This error will occur more frequently as the network grows",
        debug: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}