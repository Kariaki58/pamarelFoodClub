'use client';
import { useState, useEffect } from 'react';
import BoardProgress from './BoardProgress';

export default function UserDashboard({ userId }) {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`/api/account/user/${userId}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch user data');
        }
        
        setUserData(data.user);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  const checkBoardProgress = async () => {
    try {
      const response = await fetch('/api/account/check-board', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to check board progress');
      }
      
      // Refresh user data after checking
      const userResponse = await fetch(`/api/account/user/${userId}`);
      const userData = await userResponse.json();
      setUserData(userData.user);
      
      return data;
    } catch (err) {
      console.error('Error checking board progress:', err);
      return { error: err.message };
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!userData) return <div>No user data found</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Welcome, {userData.name}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold">Current Board</h3>
          <p className="text-xl">{userData.currentBoard}</p>
        </div>
        
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold">Referral Code</h3>
          <p className="text-xl">{userData.referralCode}</p>
        </div>
        
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold">Plan</h3>
          <p className="text-xl capitalize">{userData.plan}</p>
        </div>
      </div>
      
      <BoardProgress 
        userData={userData} 
        checkBoardProgress={checkBoardProgress} 
      />
      
      {/* <div className="mt-8 bg-white p-4 rounded shadow">
        <h2 className="text-xl font-bold mb-4">Earnings</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border p-3 rounded">
            <h3 className="font-semibold">Food Wallet</h3>
            <p>₦{userData.earnings.foodWallet.toLocaleString()}</p>
          </div>
          <div className="border p-3 rounded">
            <h3 className="font-semibold">Gadgets Wallet</h3>
            <p>₦{userData.earnings.gadgetsWallet.toLocaleString()}</p>
          </div>
          <div className="border p-3 rounded">
            <h3 className="font-semibold">Cash Wallet</h3>
            <p>₦{userData.earnings.cashWallet.toLocaleString()}</p>
          </div>
        </div>
      </div> */}
    </div>
  );
}