'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function PaymentSuccess() {
  const searchParams = useSearchParams();
  const reference = searchParams.get('reference');
  const userId = searchParams.get('userId');
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Verify payment on component mount if we have reference
    const verifyPayment = async () => {
      try {
        setLoading(true);
        const verifyUrl = `/api/payment/verify?reference=${reference}${userId ? `&userId=${userId}` : ''}`;
        const response = await fetch(verifyUrl);
        
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setUserData(data.user);
          } else {
            setError(data.error || 'Payment verification failed');
          }
        } else {
          setError('Failed to verify payment');
        }
      } catch (error) {
        console.error('Verification error:', error);
        setError('An error occurred during verification');
      } finally {
        setLoading(false);
      }
    };

    if (reference) {
      verifyPayment();
    } else {
      setLoading(false);
      setError('No payment reference found');
    }
  }, [reference, userId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-lg font-medium text-gray-900 mb-2">Verification Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link
            href="/auth/login"
            className="text-yellow-600 hover:text-yellow-500"
          >
            Try signing in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <div className="w-20 h-20 relative">
              <Image
                src="/pamarel-logo.jpeg"
                alt="Pamarel Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            Payment Successful!
          </h2>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Welcome to Pamarel!</h3>
            <div className="mt-4">
              <p className="text-sm text-gray-600">
                Your payment has been successfully processed and your account is now active.
              </p>
              {userData && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium">Username: {userData.username}</p>
                  <p className="text-sm font-medium">Email: {userData.email}</p>
                </div>
              )}
            </div>
            <div className="mt-6 space-y-3">
              <Link
                href="/auth/login"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
              >
                Sign In to Your Account
              </Link>
              <Link
                href="/"
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
              >
                Return to Homepage
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}