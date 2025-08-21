import { NextResponse } from 'next/server';
import User from '@/models/user';
import { getServerSession } from 'next-auth';
import connectToDatabase from '@/lib/dbConnect';
import { authOptions } from '../../auth/options';

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const adminUser = await User.findOne({ email: session.user.email });

    if (!adminUser || adminUser.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';
    const plan = searchParams.get('plan') || 'all';
    const board = searchParams.get('board') || 'all';

    const skip = (page - 1) * limit;

    // Build the query based on existing schema
    let query = { 
      plan: { $in: ['basic', 'classic', 'deluxe'] } // Use 'plan' instead of 'currentPlan'
    };

    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    if (status !== 'all') {
      query.status = status; // Use 'status' instead of 'isActive'
    }

    if (plan !== 'all') {
      query.plan = plan; // Use 'plan' instead of 'currentPlan'
    }

    if (board !== 'all') {
      query.currentBoard = board;
    }

    // Get affiliates with pagination
    const affiliates = await User.find(query)
      .select('username email phone plan currentBoard status referralCode referredBy createdAt boardProgress earnings')
      .populate('referredBy', 'username')
      .skip(skip)
      .limit(limit)
      .lean();
    
    // Count total affiliates for pagination
    const total = await User.countDocuments(query);

    // Enhance affiliate data with additional calculated fields
    const enhancedAffiliates = await Promise.all(affiliates.map(async (affiliate) => {
      // Calculate direct downlines (users who were referred by this affiliate)
      const directDownlines = await User.countDocuments({ referredBy: affiliate._id });
      
      // Calculate indirect downlines (recursively)
      const indirectDownlines = await calculateIndirectDownlines(affiliate._id);
      
      // Get board progress based on current board
      const boardType = affiliate.currentBoard.toLowerCase();
      const boardData = affiliate.boardProgress[boardType] || {};
      
      // Calculate referrals based on board type
      let directReferrals = 0;
      let indirectReferrals = 0;
      
      if (boardType === 'bronze') {
        directReferrals = boardData.directReferrals?.length || 0;
      } else if (boardType === 'silver') {
        directReferrals = boardData.level1Referrals?.length || 0;
        indirectReferrals = boardData.level2Referrals?.length || 0;
      } else if (boardType === 'gold') {
        directReferrals = boardData.level3Referrals?.length || 0;
        indirectReferrals = boardData.level4Referrals?.length || 0;
      }

      return {
        ...affiliate,
        directDownlines,
        indirectDownlines,
        directReferrals,
        indirectReferrals,
        totalDownlines: directDownlines + indirectDownlines,
        boardRequirements: getBoardRequirements(affiliate.currentBoard),
        isActive: affiliate.status === 'active' // Add isActive for frontend compatibility
      };
    }));

    return NextResponse.json({
      message: 'Affiliates retrieved successfully',
      data: enhancedAffiliates,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Admin Affiliates Error:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}

// Helper function to calculate indirect downlines
async function calculateIndirectDownlines(userId, maxLevel = 7) {
  let total = 0;
  
  const directDownlines = await User.find({ 
    referredBy: userId 
  }).select('_id').lean();

  const countDownlines = async (userId, currentLevel) => {
    if (currentLevel > maxLevel) return 0;
    
    const downlines = await User.find({ 
      referredBy: userId 
    }).select('_id').lean();

    let subtotal = downlines.length;
    for (const dl of downlines) {
      subtotal += await countDownlines(dl._id, currentLevel + 1);
    }
    return subtotal;
  };

  for (const dl of directDownlines) {
    total += await countDownlines(dl._id, 2); // Start counting from Level 2
  }

  return total;
}

// Helper function to get board requirements
function getBoardRequirements(boardType) {
  const board = boardType.toLowerCase();
  const requirements = {
    bronze: { direct: 7, indirect: 0 },
    silver: { direct: 7, indirect: 49 },   // 7^2
    gold: { direct: 7, indirect: 343 },    // 7^3
    completed: { direct: 0, indirect: 0 }
  };
  return requirements[board] || { direct: 0, indirect: 0 };
}