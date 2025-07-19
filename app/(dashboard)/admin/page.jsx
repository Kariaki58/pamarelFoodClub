import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { SectionCards } from "@/components/section-cards";
import Transactions from "@/components/transaction";
import WalletDisplay from '@/components/wallets/Wallet';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/options";
import connectToDatabase from "@/lib/dbConnect";
import User from "@/models/user";
import { redirect } from "next/navigation";

// Explicitly declare dynamic behavior
export const dynamic = 'force-dynamic';
export const revalidate = 0; // Prevent caching

async function getUserWallets(userId) {
  try {
    await connectToDatabase();
    const user = await User.findById(userId)
      .select('wallets')
      .lean()
      .exec();
    return user?.wallets || [];
  } catch (error) {
    console.error('Failed to fetch user wallets:', error);
    return [];
  }
}

export default async function AdminDashboard() {
  // Authentication check
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  // Data fetching
  const wallets = await getUserWallets(session.user.id);

  return (
    <div className="space-y-6">
      <SectionCards />
      
      <div className="my-5">
        <WalletDisplay wallets={wallets} />
      </div>
      
      <div className="px-4 lg:px-6 py-5">
        <ChartAreaInteractive />
      </div>
      
      <Transactions />
    </div>
  );
}