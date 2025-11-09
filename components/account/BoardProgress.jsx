'use client';
import { useState } from 'react';
import { PLANS } from '@/lib/plans';


export default function BoardProgress({ userData, checkBoardProgress }) {
  const [activeTab, setActiveTab] = useState(userData.currentBoard);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const planBoards = PLANS[userData.plan].boards;
  
  const handleCheckProgress = async () => {
    setLoading(true);
    setMessage(null);
    
    const result = await checkBoardProgress();
    
    if (result.error) {
      setMessage({ type: 'error', text: result.error });
    } else if (result.results && Object.values(result.results).some(r => r.completed)) {
      setMessage({ type: 'success', text: 'Board progress updated successfully!' });
    } else {
      setMessage({ type: 'info', text: 'No board progress changes detected.' });
    }
    
    setLoading(false);
  };

  const getBoardRequirements = (boardName) => {
    const board = planBoards.find(b => b.name.includes(boardName));
    return board ? {
      requirements1: board.requirements1,
      requirements2: board.requirement2 || '',
      earnings: board.earnings
    } : null;
  };

  const getCurrentCounts = (board) => {
    switch (board) {
      case 'Bronze':
        return {
          current: userData.counts.Bronze.directReferrals,
          required: 7
        };
      case 'Silver':
        return {
          current1: userData.counts.Silver.level1,
          required1: 7,
          current2: userData.counts.Silver.level2,
          required2: 49
        };
      case 'Gold':
        return {
          current1: userData.counts.Gold.level3,
          required1: 343,
          current2: userData.counts.Gold.level4,
          required2: 2401
        };
      // case 'Platinum':
      //   return {
      //     current1: userData.counts.Platinum.level5,
      //     required1: 16807,
      //     current2: userData.counts.Platinum.level6,
      //     required2: 117649
      //   };
      default:
        return null;
    }
  };

  return (
    <div className="bg-white p-4 rounded shadow mb-6">
      <h2 className="text-xl font-bold mb-4">Board Progress</h2>
      
      <div className="flex space-x-2 mb-6 overflow-x-auto">
        {['Bronze', 'Silver', 'Gold'].map((board) => (
          <button
            key={board}
            onClick={() => setActiveTab(board)}
            className={`px-4 py-2 rounded-t-lg ${
              activeTab === board
                ? 'bg-yellow-500 text-white'
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            {board}
          </button>
        ))}
      </div>
      
      {activeTab && (
        <div className="border rounded-b-lg p-4">
          <h3 className="text-lg font-semibold mb-2">{activeTab} Board</h3>
          
          {userData.currentBoard === activeTab && !userData.boardProgress[activeTab]?.completed && (
            <div className="mb-4">
              <button
                onClick={handleCheckProgress}
                disabled={loading}
                className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 disabled:bg-yellow-300"
              >
                {loading ? 'Checking...' : 'Check Progress'}
              </button>
              {message && (
                <p className={`mt-2 ${
                  message.type === 'error' ? 'text-red-500' : 
                  message.type === 'success' ? 'text-green-500' : 'text-yellow-500'
                }`}>
                  {message.text}
                </p>
              )}
            </div>
          )}
          
          {userData.boardProgress[activeTab]?.completed ? (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              <p>Completed on: {new Date(userData.boardProgress[activeTab].completionDate).toLocaleDateString()}</p>
            </div>
          ) : (
            <div className="mb-4">
              <h4 className="font-medium mb-2">Requirements:</h4>
              {activeTab === 'Bronze' && (
                <div>
                  <p>{getBoardRequirements(activeTab).requirements1}</p>
                  <div className="w-full bg-gray-200 rounded-full h-4 mt-2">
                    <div 
                      className="bg-yellow-500 h-4 rounded-full" 
                      style={{ width: `${Math.min(100, (getCurrentCounts(activeTab).current / getCurrentCounts(activeTab).required) * 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-sm mt-1">
                    {getCurrentCounts(activeTab).current} of {getCurrentCounts(activeTab).required} completed
                  </p>
                </div>
              )}
              
              {activeTab === 'Silver' && (
                <div>
                  <p>{getBoardRequirements(activeTab).requirements1}</p>
                  <div className="w-full bg-gray-200 rounded-full h-4 mt-2">
                    <div 
                      className="bg-yellow-500 h-4 rounded-full" 
                      style={{ width: `${Math.min(100, getCurrentCounts(activeTab).current1 / getCurrentCounts(activeTab).required1 * 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-sm mt-1">
                    {getCurrentCounts(activeTab).current1} of {getCurrentCounts(activeTab).required1} completed
                  </p>
                  
                  <p className="mt-4">{getBoardRequirements(activeTab).requirements2}</p>
                  <div className="w-full bg-gray-200 rounded-full h-4 mt-2">
                    <div 
                      className="bg-yellow-500 h-4 rounded-full" 
                      style={{ width: `${Math.min(100, getCurrentCounts(activeTab).current2 / getCurrentCounts(activeTab).required2 * 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-sm mt-1">
                    {getCurrentCounts(activeTab).current2} of {getCurrentCounts(activeTab).required2} completed
                  </p>
                </div>
              )}
              
              {activeTab === 'Gold' && (
                <div>
                  <p>{getBoardRequirements(activeTab).requirements1}</p>
                  <div className="w-full bg-gray-200 rounded-full h-4 mt-2">
                    <div 
                      className="bg-yellow-500 h-4 rounded-full" 
                      style={{ width: `${Math.min(100, getCurrentCounts(activeTab).current1 / getCurrentCounts(activeTab).required1 * 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-sm mt-1">
                    {getCurrentCounts(activeTab).current1} of {getCurrentCounts(activeTab).required1} completed
                  </p>
                  
                  
                  <p className="mt-4">{getBoardRequirements(activeTab).requirements2}</p>
                  <div className="w-full bg-gray-200 rounded-full h-4 mt-2">
                    <div 
                      className="bg-yellow-500 h-4 rounded-full" 
                      style={{ width: `${Math.min(100, getCurrentCounts(activeTab).current2 / getCurrentCounts(activeTab).required2 * 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-sm mt-1">
                    {getCurrentCounts(activeTab).current2} of {getCurrentCounts(activeTab).required2} completed
                  </p>
                </div>
              )}
              
              {/* {activeTab === 'Platinum' && (
                <div>
                  <p>{getBoardRequirements(activeTab).requirements1}</p>
                  <div className="w-full bg-gray-200 rounded-full h-4 mt-2">
                    <div 
                      className="bg-yellow-500 h-4 rounded-full" 
                      style={{ width: `${Math.min(100, getCurrentCounts(activeTab).current1 / getCurrentCounts(activeTab).required1 * 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-sm mt-1">
                    {getCurrentCounts(activeTab).current1} of {getCurrentCounts(activeTab).required1} completed
                  </p>
                  
                  <p className="mt-4">Complete 7x7 matrix (117,649 team members)</p>
                  <div className="w-full bg-gray-200 rounded-full h-4 mt-2">
                    <div 
                      className="bg-yellow-500 h-4 rounded-full" 
                      style={{ width: `${Math.min(100, getCurrentCounts(activeTab).current2 / getCurrentCounts(activeTab).required2 * 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-sm mt-1">
                    {getCurrentCounts(activeTab).current2.toLocaleString()} of {getCurrentCounts(activeTab).required2.toLocaleString()} completed
                  </p>
                </div>
              )} */}
            </div>
          )}
          
          <div>
            <h4 className="font-medium mb-2">Earnings:</h4>
            <ul className="list-disc pl-5">
              {getBoardRequirements(activeTab)?.earnings.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}