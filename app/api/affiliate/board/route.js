// app/api/affiliate/board/route.js
import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/dbConnect";
import User from "@/models/user";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/options";

export async function GET() {
  try {
    await connectToDatabase();
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await User.findById(session.user.id)
      .populate({
        path: 'downlines',
        select: 'username referralCode currentPlan boardProgress'
      })
      .populate('referredBy');

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Get only downlines with active plans
    const activeDownlines = user.downlines.filter(d => d.currentPlan);

    // Calculate indirect referrals for silver/gold boards
    const calculateIndirectReferrals = async (userId) => {
      let indirectCount = 0;
      
      // Get direct downlines with active plans
      const directDownlines = await User.find({ 
        referredBy: userId,
        currentPlan: { $exists: true, $ne: null }
      }).select('_id').lean();
      
      // For each direct downline, count their active downlines
      for (const downline of directDownlines) {
        const downlineDownlines = await User.countDocuments({ 
          referredBy: downline._id,
          currentPlan: { $exists: true, $ne: null }
        });
        indirectCount += downlineDownlines;
      }
      
      return indirectCount;
    };

    // Format board data for response
    const formatBoardData = async (boardType) => {
      const board = user.boardProgress.find(b => b.boardType === boardType);
      const requirements = getBoardRequirements(boardType);
      
      // Filter direct referrals to only include users with active plans
      const activeDirectReferrals = board?.directReferrals?.length || 0;
      
      // Calculate indirect referrals for silver/gold boards
      const indirectCount = (boardType === 'silver' || boardType === 'gold')
        ? await calculateIndirectReferrals(user._id)
        : 0;

      return {
        boardType,
        description: boardType === 'bronze' || boardType === 'platinum' 
          ? `Recruit ${requirements.direct} direct members` 
          : `Recruit ${requirements.direct} direct and ${requirements.indirect} indirect members`,
        current: {
          direct: activeDirectReferrals,
          indirect: indirectCount
        },
        requirements,
        isCurrent: user.currentBoard === boardType,
        completed: board?.completed || false,
        rewardClaimed: board?.rewardsClaimed || false,
        started: !!board,
        icon: boardType === 'bronze' ? '🥉' : 
              boardType === 'silver' ? '🥈' : 
              boardType === 'gold' ? '🥇' : '💎'
      };
    };

    const responseData = {
      referralCode: user.referralCode,
      currentPlan: user.currentPlan,
      boards: {
        bronze: await formatBoardData('bronze'),
        silver: await formatBoardData('silver'),
        gold: await formatBoardData('gold'),
        platinum: await formatBoardData('platinum')
      },
      currentBoard: user.currentBoard,
      wallets: user.wallets,
      lifetimeStats: {
        totalEarnings: user.wallets.cash + user.wallets.food + user.wallets.gadget,
        rewardsClaimed: user.boardProgress.filter(b => b.rewardsClaimed).length,
        totalRecruits: activeDownlines.length // Only count active downlines
      }
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Error fetching affiliate data:", error);
    return NextResponse.json(
      { error: "Failed to fetch affiliate data" },
      { status: 500 }
    );
  }
}

function getBoardRequirements(boardType) {
  switch(boardType) {
    case 'bronze':
    case 'platinum':
      return { direct: 7, indirect: 0 };
    case 'silver':
    case 'gold':
      return { direct: 7, indirect: 49 };
    default:
      return { direct: 0, indirect: 0 };
  }
}