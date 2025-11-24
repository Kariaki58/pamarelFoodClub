import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/dbConnect';
import User from '@/models/user';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../auth/options';

export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Not Authorized" }, { status: 403 });
    }

    const { id } = await params;
    
    await connectToDatabase();

    // Verify admin user exists
    const findUserAdmin = await User.findOne({ _id: session.user.id });
    if (!findUserAdmin) {
      return NextResponse.json({ error: "Admin user not found" }, { status: 404 });
    }

    // NEW: Better network calculation - get each level separately
    const calculateSpecificLevel = async (userId, targetLevel, currentLevel = 0) => {
      if (currentLevel > targetLevel) return { count: 0, users: [] };
      
      const directDownlines = await User.find({ 
        referredBy: userId,
        currentPlan: { $exists: true, $ne: null }
      }).select('_id username currentBoard').lean();
      
      if (currentLevel === targetLevel) {
        return { count: directDownlines.length, users: directDownlines };
      }
      
      let totalCount = 0;
      let levelUsers = [];
      
      // Recursively get the next level
      for (const downline of directDownlines) {
        const nextLevelData = await calculateSpecificLevel(downline._id, targetLevel, currentLevel + 1);
        totalCount += nextLevelData.count;
        levelUsers = levelUsers.concat(nextLevelData.users);
      }
      
      return { count: totalCount, users: levelUsers };
    };

    // Get each level separately for accurate counts
    const level0 = await calculateSpecificLevel(id, 0); // Direct referrals
    const level1 = await calculateSpecificLevel(id, 1); // Level 1 (downlines of direct referrals)
    const level2 = await calculateSpecificLevel(id, 2); // Level 2 (downlines of level 1)
    const level3 = await calculateSpecificLevel(id, 3); // Level 3 (downlines of level 2)
    const level4 = await calculateSpecificLevel(id, 4); // Level 4 (downlines of level 3)

    // Get board progress from user data
    const user = await User.findById(id).populate('boardProgress');
    const boardProgress = user?.boardProgress || [];
    
    const bronzeProgress = boardProgress.find(bp => bp.boardType === 'bronze') || {};
    const silverProgress = boardProgress.find(bp => bp.boardType === 'silver') || {};
    const goldProgress = boardProgress.find(bp => bp.boardType === 'gold') || {};
    const platinumProgress = boardProgress.find(bp => bp.boardType === 'platinum') || {};

    // DEBUG: Log the actual counts to see what's happening
    console.log('Network counts for user:', id);
    console.log('Level 0 (Direct):', level0.count);
    console.log('Level 1:', level1.count);
    console.log('Level 2:', level2.count);
    console.log('Level 3:', level3.count);
    console.log('Level 4:', level4.count);

    return NextResponse.json({
      success: true,
      bronze: {
        directReferrals: level0.count,
        completed: bronzeProgress.completed || false,
        totalRequired: 7
      },
      silver: {
        level1Referrals: level1.count,  // Fixed: Direct count for level 1
        level2Referrals: level2.count,  // Fixed: Direct count for level 2
        completed: silverProgress.completed || false,
        level1Required: 7,    // 7 people for level 1
        level2Required: 49    // 49 people for level 2
      },
      gold: {
        level3Referrals: level3.count,  // Fixed: Direct count for level 3
        level4Referrals: level4.count,  // Fixed: Direct count for level 4
        completed: goldProgress.completed || false,
        level3Required: 343,  // 343 people for level 3
        level4Required: 2401  // 2401 people for level 4
      },
      platinum: {
        completed: platinumProgress.completed || false,
        totalRequired: 7
      },
      networkSummary: {
        totalNetwork: level0.count + level1.count + level2.count + level3.count + level4.count,
        level0: level0.count,
        level1: level1.count,
        level2: level2.count,
        level3: level3.count,
        level4: level4.count
      },
      // Add debug info
      debug: {
        userId: id,
        username: user?.username,
        levels: {
          0: level0.count,
          1: level1.count,
          2: level2.count,
          3: level3.count,
          4: level4.count
        }
      }
    });

  } catch (error) {
    console.error('Error calculating network:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}