import User from '@/models/user';
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/dbConnect';


export async function GET(req, { params }) {
  try {
    const { userId } = await params;

    await connectToDatabase();

    const user = await User.findById(userId)
      .populate('referredBy', 'name email referralCode')
      .populate('boardProgress.Bronze.directReferrals', 'name email currentBoard')
      .populate('boardProgress.Silver.level1Referrals', 'name email currentBoard')
      .populate('boardProgress.Silver.level2Referrals', 'name email currentBoard')
      .populate('boardProgress.Gold.level3Referrals', 'name email currentBoard')
      .populate('boardProgress.Gold.level4Referrals', 'name email currentBoard')

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Calculate counts for each level
    const counts = {
      Bronze: {
        directReferrals: user.boardProgress.Bronze.directReferrals.length
      },
      Silver: {
        level1: user.boardProgress.Silver.level1Referrals.length,
        level2: user.boardProgress.Silver.level2Referrals.length,
        total: user.boardProgress.Silver.level1Referrals.length + 
               user.boardProgress.Silver.level2Referrals.length
      },
      Gold: {
        level3: user.boardProgress.Gold.level3Referrals.length,
        level4: user.boardProgress.Gold.level4Referrals.length,
        total: user.boardProgress.Gold.level3Referrals.length + 
            user.boardProgress.Gold.level4Referrals.length
      },
    };

    return NextResponse.json({ 
      success: true, 
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        referralCode: user.referralCode,
        currentBoard: user.currentBoard,
        plan: user.plan,
        earnings: user.earnings,
        referredBy: user.referredBy,
        counts,
        boardProgress: user.boardProgress
      }
    });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}