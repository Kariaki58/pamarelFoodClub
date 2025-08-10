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

    // Build the query
    let query = { type: 'affiliate' };

    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    if (status !== 'all') {
      query.status = status;
    }

    if (plan !== 'all') {
      query.currentPlan = plan;
    }

    if (board !== 'all') {
      query.currentBoard = board;
    }

    // Get affiliates with pagination
    const affiliates = await User.find(query)
      .select('username email phone currentPlan currentBoard status isActive lastLogin planHistory boardProgress downlines referredBy createdAt')
      .populate('referredBy', 'username')
      .skip(skip)
      .limit(limit)
      .lean();

    // Count total affiliates for pagination
    const total = await User.countDocuments(query);

    // Enhance affiliate data with additional calculated fields
    const enhancedAffiliates = await Promise.all(affiliates.map(async (affiliate) => {
      const directDownlines = affiliate.downlines?.length || 0;
      const indirectDownlines = await calculateIndirectDownlines(affiliate._id);
      
      const currentBoardProgress = affiliate.boardProgress?.find(b => b.boardType === affiliate.currentBoard) || {};
      const directReferrals = currentBoardProgress.directReferrals?.length || 0;
      const indirectReferrals = currentBoardProgress.indirectReferrals?.length || 0;

      return {
        ...affiliate,
        directDownlines,
        indirectDownlines,
        directReferrals,
        indirectReferrals,
        totalDownlines: directDownlines + indirectDownlines,
        boardRequirements: getBoardRequirements(affiliate.currentBoard)
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
  const requirements = {
    bronze: { direct: 7, indirect: 0 },
    silver: { direct: 7, indirect: 49 },   // 7^2
    gold: { direct: 7, indirect: 343 },    // 7^3
    platinum: { direct: 7, indirect: 2401 }, // 7^4
    exit: { direct: 7, indirect: 960799 }  // 7^7 - 1
  };
  return requirements[boardType] || { direct: 0, indirect: 0 };
}