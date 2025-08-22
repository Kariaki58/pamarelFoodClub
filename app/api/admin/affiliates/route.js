import User from '@/models/user';
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/dbConnect';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/options';

// GET all users progress with filtering, sorting and pagination (Admin only)
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);


    if (!session) {
      return NextResponse.json({ error: "unauthenticated" }, { status: 400 })
    }

    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "not Authorized" }, { status: 400 })
    }
    await connectToDatabase();

    const findUserAdmin = await User.findOne({ _id: session.user.id })

    if (!findUserAdmin) {
      return NextResponse.json({ error: "Not found user" }, { status: 404 })
    }

    if (findUserAdmin.role !== "admin") {
      return NextResponse.json({ error: "you are not an admin" }, { status: 400 })
    }

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';
    const plan = searchParams.get('plan') || 'all';
    const board = searchParams.get('board') || 'all';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build filter object
    let filter = {};
    
    // Search filter
    if (search) {
      filter.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { referralCode: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Status filter
    if (status !== 'all') {
      filter.status = status;
    }
    
    // Plan filter
    if (plan !== 'all') {
      filter.plan = plan;
    }
    
    // Board filter
    if (board !== 'all') {
      filter.currentBoard = board;
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Fetch users with filtering, sorting and pagination
    const users = await User.find(filter)
      .populate('referredBy', 'username email referralCode')
      .populate('boardProgress.Bronze.directReferrals', 'username email currentBoard')
      .populate('boardProgress.Silver.level1Referrals', 'username email currentBoard')
      .populate('boardProgress.Silver.level2Referrals', 'username email currentBoard')
      .populate('boardProgress.Gold.level3Referrals', 'username email currentBoard')
      .populate('boardProgress.Gold.level4Referrals', 'username email currentBoard')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const totalUsers = await User.countDocuments(filter);
    const totalPages = Math.ceil(totalUsers / limit);

    // Transform user data with counts
    const formattedUsers = users.map(user => {
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

      return {
        _id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        referralCode: user.referralCode,
        currentBoard: user.currentBoard,
        plan: user.plan,
        earnings: user.earnings,
        referredBy: user.referredBy,
        counts,
        boardProgress: user.boardProgress,
        createdAt: user.createdAt,
        status: user.status,
        role: user.role
      };
    });

    return NextResponse.json({ 
      success: true, 
      users: formattedUsers,
      currentPage: page,
      totalPages,
      totalUsers,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}