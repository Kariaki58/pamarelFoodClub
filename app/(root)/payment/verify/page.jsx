"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function PaymentVerify() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get query params from URL
  const reference = searchParams.get("reference");
  const trxref = searchParams.get("trxref");

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const paymentReference = reference || trxref;

        if (!paymentReference) {
          router.push("/payment/failed?error=no_reference");
          return;
        }

        const response = await fetch(
          `/api/payment/verify?reference=${paymentReference}`
        );

        if (response.redirected) {
          window.location.href = response.url;
        } else {
          const data = await response.json();
          if (data.success) {
            router.push(
              `/payment/success?reference=${paymentReference}&userId=${data.user.id}`
            );
          } else {
            router.push(`/payment/failed?error=${data.error}`);
          }
        }
      } catch (error) {
        console.error("Verification error:", error);
        router.push("/payment/failed?error=verification_error");
      }
    };

    if (reference || trxref) {
      verifyPayment();
    }
  }, [reference, trxref, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Verifying your payment...</p>
      </div>
    </div>
  );
}
