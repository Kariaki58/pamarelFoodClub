import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/dbConnect";
import User from "@/models/user";
import { PLANS } from "@/lib/plans";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/options";

export async function POST(request) {
  try {
    await connectToDatabase();
    const { boardType, rewardOption } = await request.json();
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Convert boardType to proper case for object lookup
    const boardTypeProper = boardType.charAt(0).toUpperCase() + boardType.slice(1).toLowerCase();

    // Handle both array and object structures for boardProgress
    let boardProgress;
    if (Array.isArray(user.boardProgress)) {
      // Array structure
      boardProgress = user.boardProgress.find(b => b.boardType === boardType.toLowerCase());
    } else if (user.boardProgress && typeof user.boardProgress === 'object') {
      // Object structure - use the proper case key
      boardProgress = user.boardProgress[boardTypeProper];
      
      // If we're using object structure and need to convert to array for future operations
      if (boardProgress && !Array.isArray(user.boardProgress)) {
        // Convert the entire boardProgress to array format
        user.boardProgress = Object.keys(user.boardProgress).map(key => {
          const board = user.boardProgress[key];
          return {
            boardType: key.toLowerCase(),
            directReferrals: board.directReferrals || board.level1Referrals || board.level3Referrals || [],
            indirectReferrals: board.indirectReferrals || board.level2Referrals || board.level4Referrals || [],
            completed: board.completed || false,
            rewardsClaimed: board.rewardsClaimed || false,
            completionDate: board.completionDate,
            claimedOption: board.claimedOption,
            claimedAt: board.claimedAt
          };
        });
        
        // Now find the boardProgress in the new array
        boardProgress = user.boardProgress.find(b => b.boardType === boardType.toLowerCase());
      }
    }

    if (!boardProgress || !boardProgress.completed || boardProgress.rewardsClaimed) {
      return NextResponse.json(
        { error: "Board not completed or reward already claimed" },
        { status: 400 }
      );
    }

    // Get rewards from PLANS configuration
    const plan = PLANS[user.currentPlan || user.plan];
    if (!plan) {
      return NextResponse.json(
        { error: "Invalid plan configuration" },
        { status: 500 }
      );
    }

    const boardConfig = plan.boards.find(b => 
      b.name.toLowerCase().includes(boardType.toLowerCase())
    );

    if (!boardConfig) {
      return NextResponse.json(
        { error: "Board configuration not found" },
        { status: 500 }
      );
    }

    // Initialize wallets if they don't exist
    if (!user.earnings) {
      user.earnings = {
        food: user.earnings?.foodWallet || 0,
        gadget: user.earnings?.gadgetsWallet || 0,
        cash: user.earnings?.cashWallet || 0
      };
    }

    // Process rewards based on user selection
    let processedRewards = [];
    
    boardConfig.earnings.forEach(earning => {
      const amount = extractAmount(earning) || 0;

      // Handle OR options specifically first
      if (earning.includes('OR') && rewardOption) {
        const options = earning.split('OR').map(opt => opt.trim());
        const selectedOption = options.find(opt => 
          opt.toLowerCase().includes(rewardOption.toLowerCase())
        );
        
        if (selectedOption) {
          const selectedAmount = extractAmount(selectedOption) || 0;
          if (selectedOption.toLowerCase().includes('cash')) {
            user.earnings.cashWallet += selectedAmount;
            processedRewards.push({ type: 'cash', amount: selectedAmount, description: selectedOption });
          } else if (selectedOption.toLowerCase().includes('food') || selectedOption.toLowerCase().includes('foody')) {
            user.earnings.foodWallet += selectedAmount;
            processedRewards.push({ type: 'food', amount: selectedAmount, description: selectedOption });
          } else if (selectedOption.toLowerCase().includes('gadget')) {
            user.earnings.gadgetsWallet += selectedAmount;
            processedRewards.push({ type: 'gadget', amount: selectedAmount, description: selectedOption });
          }
        }
        return; // Skip further processing for OR options
      }

      // Process regular rewards (non-OR)
      if (!rewardOption || rewardOption === 'auto') {
        if (earning.includes('FOODY BAG') || earning.includes('Food Wallet') || earning.toLowerCase().includes('food')) {
          user.earnings.foodWallet += amount;
          processedRewards.push({ type: 'food', amount, description: earning });
        } 
        else if (earning.includes('Gadgets Wallet') || earning.toLowerCase().includes('gadget')) {
          user.earnings.gadgetsWallet += amount;
          processedRewards.push({ type: 'gadget', amount, description: earning });
        }
        else if (earning.includes('Cash Wallet') || earning.includes('CASH') || earning.includes('Cashback') || earning.toLowerCase().includes('cash')) {
          user.earnings.cashWallet += amount;
          processedRewards.push({ type: 'cash', amount, description: earning });
        }
      } else {
        // If specific reward option is selected, only process matching rewards
        if (rewardOption === 'food' && (earning.includes('FOODY BAG') || earning.includes('Food Wallet') || earning.toLowerCase().includes('food'))) {
          user.earnings.foodWallet += amount;
          processedRewards.push({ type: 'food', amount, description: earning });
        }
        else if (rewardOption === 'gadget' && (earning.includes('Gadgets Wallet') || earning.toLowerCase().includes('gadget'))) {
          user.earnings.gadgetsWallet += amount;
          processedRewards.push({ type: 'gadget', amount, description: earning });
        }
        else if (rewardOption === 'cash' && (earning.includes('Cash Wallet') || earning.includes('CASH') || earning.includes('Cashback') || earning.toLowerCase().includes('cash'))) {
          user.earnings.cashWallet += amount;
          processedRewards.push({ type: 'cash', amount, description: earning });
        }
      }
    });

    // Mark reward as claimed
    boardProgress.rewardsClaimed = true;
    boardProgress.claimedOption = rewardOption;
    boardProgress.claimedAt = new Date();

    // If not the last board, move to next board
    const boardsOrder = ['bronze', 'silver', 'gold', 'platinum'];
    const currentIndex = boardsOrder.indexOf(boardType.toLowerCase());
    
    if (currentIndex < boardsOrder.length - 1) {
      const nextBoard = boardsOrder[currentIndex + 1];
      user.currentBoard = nextBoard;
      
      // Initialize next board if not exists (for array structure)
      if (Array.isArray(user.boardProgress) && !user.boardProgress.some(b => b.boardType === nextBoard)) {
        user.boardProgress.push({
          boardType: nextBoard,
          directReferrals: [],
          indirectReferrals: [],
          completed: false,
          rewardsClaimed: false
        });
      }
    }

    await user.save();

    return NextResponse.json({
      success: true,
      message: "Rewards claimed successfully",
      wallets: user.earnings,
      processedRewards,
      nextBoard: user.currentBoard
    });

  } catch (error) {
    console.error("Error claiming reward:", error);
    return NextResponse.json(
      { error: "Failed to claim reward: " + error.message },
      { status: 500 }
    );
  }
}

function extractAmount(text) {
  if (!text) return 0;
  const match = text.match(/₦([\d,]+)/);
  return match ? parseInt(match[1].replace(/,/g, '')) : 0;
}