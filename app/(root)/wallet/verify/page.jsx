"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function WalletVerifyPage() {
  const [status, setStatus] = useState('Verifying...');
  const searchParams = useSearchParams();
  const router = useRouter();
  const callbackUrl = searchParams.get('callbackUrl')


  useEffect(() => {
    const reference = searchParams.get('reference');
    const trxref = searchParams.get('trxref');


    if (!reference || !trxref) {
      setStatus('Missing reference');
      startRedirectTimer();
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch(`/api/wallets/verify?reference=${reference}&trxref=${trxref}`);
        const data = await res.json();

        if (data.success) {
          setStatus(`✅ Payment successful! ₦${data.amount} added to your ${data.walletType} wallet.`);
        } else {
          setStatus('❌ Payment failed: ' + (data.error || 'Unknown error'));
        }
      } catch (e) {
        console.error(e);
        setStatus('Error verifying payment.');
      } finally {
        startRedirectTimer();
      }
    };

    verify();
  }, [searchParams, router]);

  const startRedirectTimer = () => {
    setTimeout(() => {
      if (callbackUrl !== "undefined") {
        router.push(callbackUrl)
        return;
      }
      router.push('/account');
    }, 5000); // 5 seconds
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white shadow p-6 rounded-lg text-center max-w-md w-full">
        <h1 className="text-xl font-semibold mb-4">Wallet Funding Status</h1>
        <div className="mb-4">
          <p className="text-gray-700">{status}</p>
        </div>
        <p className="text-sm text-gray-500">
          You will be redirected to your account page in 5 seconds...
        </p>
      </div>
    </div>
  );
}