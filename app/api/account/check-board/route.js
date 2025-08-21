import connectToDatabase from '@/lib/dbConnect';
import BoardCompletion from '@/models/BoardCompletion';
import { NextResponse } from 'next/server';
import { PLANS } from '@/lib/plans';
import User from '@/models/user';


export async function POST(req) {
  try {
    const { userId } = await req.json();
    await connectToDatabase();

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const results = {};
    
    if (user.currentBoard === 'Bronze' && !user.boardProgress.Bronze.completed) {
      results.Bronze = await checkBoardCompletion(userId, 'Bronze');
    }
    
    if (user.currentBoard === 'Silver' && !user.boardProgress.Silver.completed) {
      results.Silver = await checkBoardCompletion(userId, 'Silver');
    }
    
    if (user.currentBoard === 'Gold' && !user.boardProgress.Gold.completed) {
      results.Gold = await checkBoardCompletion(userId, 'Gold');
    }

    return NextResponse.json({ success: true, results });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function checkBoardCompletion(userId, board) {
  const user = await User.findById(userId).populate('referredBy');
  const plan = PLANS[user.plan];
  const boardData = plan.boards.find(b => b.name.includes(board));

  let isCompleted = false;
  let updateData = {};
  let earnings = {};

  switch (board) {
    case 'Bronze':
      if (user.boardProgress.Bronze.directReferrals.length >= 7) {
        isCompleted = true;
        updateData = {
          'boardProgress.Bronze.completed': true,
          'boardProgress.Bronze.completionDate': new Date(),
          currentBoard: 'Silver'
        };
        
        earnings = extractEarnings(boardData.earnings);

        if (user.referredBy) {
          await updateUplineReferences(user.referredBy._id, userId, 'Silver', 1);
        }
      }
      break;

    case 'Silver':
      if (user.boardProgress.Silver.level1Referrals.length >= 7 && 
          user.boardProgress.Silver.level2Referrals.length >= 49) {
        isCompleted = true;
        updateData = {
          'boardProgress.Silver.completed': true,
          'boardProgress.Silver.completionDate': new Date(),
          currentBoard: 'Gold'
        };
        
        earnings = extractEarnings(boardData.earnings);

        if (user.referredBy) {
          await updateUplineReferences(user.referredBy._id, userId, 'Gold', 3);
        }
      }
      break;

    case 'Gold':
      if (user.boardProgress.Gold.level3Referrals.length >= 343 && 
          user.boardProgress.Gold.level4Referrals.length >= 2401) {
        isCompleted = true;
        updateData = {
          'boardProgress.Gold.completed': true,
          'boardProgress.Gold.completionDate': new Date(),
          currentBoard: 'Platinum'
        };
        
        earnings = extractEarnings(boardData.earnings);

        if (user.referredBy) {
          await updateUplineReferences(user.referredBy._id, userId, 'Platinum', 5);
        }
      }
      break;
  }

  if (isCompleted) {
    await User.findByIdAndUpdate(userId, {
      $set: updateData,
      $inc: {
        'earnings.foodWallet': earnings.foodWallet || 0,
        'earnings.gadgetsWallet': earnings.gadgetsWallet || 0,
        'earnings.cashWallet': earnings.cashWallet || 0
      }
    });

    // Record board completion
    const completionRecord = new BoardCompletion({
      user: userId,
      board,
      earnings
    });
    await completionRecord.save();
  }

  return { completed: isCompleted, board, earnings };
}

async function updateUplineReferences(uplineId, userId, targetBoard, currentLevel) {
  const upline = await User.findById(uplineId);
  if (!upline || currentLevel > 6) return;

  let updateField = '';
  let shouldCheckCompletion = false;

  switch (upline.currentBoard) {
    case 'Silver':
      if (targetBoard === 'Silver') {
        updateField = currentLevel === 1 
          ? 'boardProgress.Silver.level1Referrals'
          : 'boardProgress.Silver.level2Referrals';
      }
      break;

    case 'Gold':
      if (targetBoard === 'Silver' && currentLevel >= 3) {
        updateField = currentLevel === 3
          ? 'boardProgress.Gold.level3Referrals'
          : 'boardProgress.Gold.level4Referrals';
      }
      break;
  }

  if (updateField) {
    console.log(`Adding ${userId} to ${uplineId}'s ${updateField}`);
    await User.findByIdAndUpdate(uplineId, {
      $addToSet: { [updateField]: userId }
    });
    shouldCheckCompletion = true;
  }

  if (upline.referredBy) {
    console.log("upding....", upline.referredBy._id)
    await updateUplineReferences(
      upline.referredBy._id,
      userId,
      targetBoard,
      currentLevel + 1
    );
  }

  if (shouldCheckCompletion) {
    await checkBoardCompletion(uplineId, upline.currentBoard);
  }
}

function extractEarnings(earningsArray) {
  const earnings = {};
  
  earningsArray.forEach(item => {
    if (item.includes('Food Wallet') || item.includes('Foody Bag')) {
      const amount = item.match(/₦([\d,]+)/);
      if (amount) earnings.foodWallet = parseFloat(amount[1].replace(/,/g, ''));
    } 
    else if (item.includes('Gadgets Wallet')) {
      const amount = item.match(/₦([\d,]+)/);
      if (amount) earnings.gadgetsWallet = parseFloat(amount[1].replace(/,/g, ''));
    } 
    else if (item.includes('Cash Wallet')) {
      const amount = item.match(/₦([\d,]+)/);
      if (amount) earnings.cashWallet = parseFloat(amount[1].replace(/,/g, ''));
    }
  });

  return earnings;
}