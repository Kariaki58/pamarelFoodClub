"use client";
import UserDashboard from "@/components/account/UserDashboard";
import { AffiliateProgress } from "@/components/layout/AffiliateProgress";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AffiliatePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);
  
  // Show loading state while session is being fetched
  if (status === "loading") {
    return <div>Loading...</div>;
  }
  
  // Return null or loading while redirecting
  if (!session) {
    return <div>Redirecting...</div>
  }
  
  return (
    <div>
      <UserDashboard userId={session.user.id} />
    </div>
    // <AffiliateProgress />
  );
}