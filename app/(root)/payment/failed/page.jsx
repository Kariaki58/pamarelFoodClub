'use client';
import Link from 'next/link';
import Image from 'next/image';

export default function PaymentFailed() {
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
            Payment Failed
          </h2>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Payment Unsuccessful</h3>
            <div className="mt-4">
              <p className="text-sm text-gray-600">
                We couldn't process your payment. Please try again or contact support if the issue persists.
              </p>
            </div>
            <div className="mt-6">
              <Link
                href="/join-member"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
              >
                Try Again
              </Link>
            </div>
            <div className="mt-4">
              <Link
                href="/"
                className="text-sm text-yellow-600 hover:text-yellow-500"
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