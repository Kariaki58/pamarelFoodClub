'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ArrowRight, Info, Users, Trophy, Gift, Wallet } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export const AffiliateProgress = () => {
  // Enhanced dummy data with Basic Plan
  const dummyData = {
    currentBoard: 'basic', // basic/bronze/silver/gold/platinum
    boardProgress: {
      basic: { membersRecruited: 0 },
      bronze: { 
        completed: false,
        membersRecruited: 0
      },
      silver: {
        completed: false,
        level1Recruited: 0,
        level2Recruited: 0
      },
      gold: {
        completed: false,
        level1Recruited: 0,
        level2Recruited: 0
      },
      platinum: {
        completed: false,
        membersRecruited: 0
      }
    },
    directDownlines: 0,
    networkDownlines: 0,
    earnings: {
      total: 0
    }
  };

  const progressData = {
    currentBoard: dummyData.currentBoard,
    nextBoard: getNextBoard(dummyData.currentBoard),
    boards: {
      basic: {
        completed: false,
        progress: 0,
        required: 1, // Just needs to join
        current: 1,
        reward: 'Access to System',
        icon: <Wallet className="w-5 h-5" />
      },
      bronze: {
        completed: dummyData.boardProgress.bronze.completed,
        progress: Math.round((dummyData.boardProgress.basic.membersRecruited / 7) * 100),
        required: 7,
        current: dummyData.boardProgress.basic.membersRecruited,
        reward: '₦13,000 FOODY BAG',
        icon: <Trophy className="w-5 h-5 text-amber-500" />
      },
      silver: {
        completed: dummyData.boardProgress.silver.completed,
        progress: Math.round(((dummyData.boardProgress.silver.level1Recruited + 
                             dummyData.boardProgress.silver.level2Recruited) / 56) * 100),
        required: 56,
        current: dummyData.boardProgress.silver.level1Recruited + 
                dummyData.boardProgress.silver.level2Recruited,
        reward: '₦100,000 - ₦110,000',
        icon: <Trophy className="w-5 h-5 text-gray-400" />
      },
      gold: {
        completed: dummyData.boardProgress.gold.completed,
        progress: Math.round(((dummyData.boardProgress.gold.level1Recruited + 
                             dummyData.boardProgress.gold.level2Recruited) / 56) * 100),
        required: 56,
        current: dummyData.boardProgress.gold.level1Recruited + 
                dummyData.boardProgress.gold.level2Recruited,
        reward: '₦1,300,000',
        icon: <Trophy className="w-5 h-5 text-yellow-500" />
      },
      platinum: {
        completed: dummyData.boardProgress.platinum.completed,
        progress: Math.round((dummyData.boardProgress.platinum.membersRecruited / 7) * 100),
        required: 7,
        current: dummyData.boardProgress.platinum.membersRecruited,
        reward: '₦14,000,000 + Car Award',
        icon: <Trophy className="w-5 h-5 text-blue-500" />
      }
    },
    teamStats: {
      directDownlines: dummyData.directDownlines,
      networkDownlines: dummyData.networkDownlines,
      totalEarnings: dummyData.earnings.total
    }
  };

  return (
    <Card className="mb-6 border-0 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Users className="w-6 h-6 mr-2 text-primary" />
            <span className="text-2xl font-bold">Affiliate Dashboard</span>
          </div>
          <Badge variant="outline" className="px-3 py-1 text-sm">
            {progressData.currentBoard === 'basic' ? 'Basic Plan' : progressData.currentBoard.charAt(0).toUpperCase() + progressData.currentBoard.slice(1)}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-8">
        {/* Board Progression - Now in 3x2 grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center">
              <Trophy className="w-5 h-5 mr-2 text-primary" />
              Board Progression
            </h3>
            {progressData.nextBoard && (
              <div className="flex items-center text-sm text-muted-foreground">
                Next: <span className="font-medium ml-1 capitalize">{progressData.nextBoard}</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
            {/* First Row - Basic, Bronze, Silver */}
            <div className="space-y-4">
              <BoardCard 
                board="basic"
                data={progressData.boards.basic}
                isCurrent={progressData.currentBoard === 'basic'}
                isCompleted={progressData.boards.basic.completed}
              />
              <BoardCard 
                board="bronze"
                data={progressData.boards.bronze}
                isCurrent={progressData.currentBoard === 'bronze'}
                isCompleted={progressData.boards.bronze.completed}
              />
            </div>
            
            {/* Second Row - Silver, Gold */}
            <div className="space-y-4">
              <BoardCard 
                board="silver"
                data={progressData.boards.silver}
                isCurrent={progressData.currentBoard === 'silver'}
                isCompleted={progressData.boards.silver.completed}
              />
              <BoardCard 
                board="gold"
                data={progressData.boards.gold}
                isCurrent={progressData.currentBoard === 'gold'}
                isCompleted={progressData.boards.gold.completed}
              />
            </div>
            
            {/* Third Row - Platinum (centered) */}
            <div className="space-y-4">
              <div className="h-full flex flex-col justify-center">
                <BoardCard 
                  board="platinum"
                  data={progressData.boards.platinum}
                  isCurrent={progressData.currentBoard === 'platinum'}
                  isCompleted={progressData.boards.platinum.completed}
                />
              </div>
              {/* Empty space to maintain grid structure */}
              <div className="opacity-0 pointer-events-none">
                <BoardCard 
                  board="basic"
                  data={progressData.boards.basic}
                  isCurrent={false}
                  isCompleted={false}
                />
              </div>
            </div>
          </div>
          
          <div className="text-xs text-muted-foreground mt-2">
            * Complete requirements to advance to the next board
          </div>
        </div>

        {/* Team Stats */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2 text-primary" />
            Team Overview
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard 
              title="Direct Team"
              value={progressData.teamStats.directDownlines}
              description="Members you personally recruited"
              icon={<Users className="w-5 h-5 text-blue-500" />}
            />
            <StatCard 
              title="Network Team"
              value={progressData.teamStats.networkDownlines}
              description="Your team's total recruits"
              icon={<Users className="w-5 h-5 text-purple-500" />}
            />
            <StatCard 
              title="Total Earnings"
              value={`₦${progressData.teamStats.totalEarnings.toLocaleString()}`}
              description="Your all-time earnings"
              icon={<Wallet className="w-5 h-5 text-green-500" />}
              isCurrency
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-col space-y-4">
          <h3 className="text-lg font-semibold flex items-center">
            <Gift className="w-5 h-5 mr-2 text-primary" />
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Link 
              href="/recruit" 
              className="group flex flex-col items-center justify-center p-4 border rounded-xl hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              <div className="w-10 h-10 bg-primary/10 group-hover:bg-primary/20 rounded-full flex items-center justify-center mb-2">
                <Users className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium">Recruit Members</span>
            </Link>
            <Link 
              href="/team" 
              className="group flex flex-col items-center justify-center p-4 border rounded-xl hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              <div className="w-10 h-10 bg-primary/10 group-hover:bg-primary/20 rounded-full flex items-center justify-center mb-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <span className="text-sm font-medium">Team Dashboard</span>
            </Link>
            <Link 
              href="/rewards" 
              className="group flex flex-col items-center justify-center p-4 border rounded-xl hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              <div className="w-10 h-10 bg-primary/10 group-hover:bg-primary/20 rounded-full flex items-center justify-center mb-2">
                <Gift className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium">Claim Rewards</span>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Helper Components
const BoardCard = ({ board, data, isCurrent, isCompleted }) => {
  const boardInfo = {
    basic: {
      name: 'Basic Plan',
      color: 'bg-gray-500',
      description: 'Start your journey'
    },
    bronze: {
      name: 'Bronze',
      color: 'bg-amber-500',
      description: 'Recruit 7 members'
    },
    silver: {
      name: 'Silver',
      color: 'bg-gray-400',
      description: 'Build your network'
    },
    gold: {
      name: 'Gold',
      color: 'bg-yellow-500',
      description: 'Expand your team'
    },
    platinum: {
      name: 'Platinum',
      color: 'bg-blue-500',
      description: 'Top achiever'
    }
  };

  return (
    <div className={`relative border rounded-xl p-4 transition-all ${isCurrent ? 'ring-2 ring-primary shadow-md' : 'hover:shadow-md'}`}>
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center mb-2">
            <div className={`w-3 h-3 rounded-full ${boardInfo[board].color} mr-2`}></div>
            <h4 className="font-medium text-sm">{boardInfo[board].name}</h4>
          </div>
          <p className="text-xs text-muted-foreground mb-3">{boardInfo[board].description}</p>
          
          {!isCompleted && board !== 'basic' && (
            <div className="mb-2">
              <Progress value={data.progress} className="h-2" />
              <div className="flex justify-between text-xs mt-1">
                <span>{data.current}/{data.required}</span>
                <span>{data.progress}%</span>
              </div>
            </div>
          )}
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Reward:</span>
            <span className="font-medium text-right">{data.reward}</span>
          </div>
        </div>
        
        {data.icon && (
          <div className={`p-2 rounded-lg ${isCurrent ? 'bg-primary/10' : 'bg-muted'}`}>
            {data.icon}
          </div>
        )}
      </div>
      
      {isCompleted && (
        <div className="absolute -top-2 -right-2">
          <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ title, value, description, icon, isCurrency = false }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-muted-foreground">{title}</h4>
        {icon}
      </div>
      <p className="text-2xl font-bold">
        {isCurrency ? value : value.toLocaleString()}
      </p>
      <Tooltip>
        <TooltipTrigger className="mt-2 text-xs text-muted-foreground flex items-center">
          <Info className="w-3 h-3 mr-1" />
          {description}
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-sm max-w-xs">{description}</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
};

// Helper function
function getNextBoard(currentBoard) {
  const boards = ['basic', 'bronze', 'silver', 'gold', 'platinum'];
  const currentIndex = boards.indexOf(currentBoard);
  return currentIndex < boards.length - 1 ? boards[currentIndex + 1] : null;
}