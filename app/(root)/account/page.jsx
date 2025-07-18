import { DashboardSummary } from "@/components/account/dashboard-summary";
import { OrderHistory } from "@/components/account/order-history";
import { PendingReviews } from "@/components/account/pending-reviews";
import { Separator } from "@/components/ui/separator";
import WalletDisplay from "@/components/wallets/Wallet";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/options";
import connectToDatabase from "@/lib/dbConnect";
import User from "@/models/user";
import { redirect } from "next/navigation";



export default async function AccountPage() {
  let user = null;

  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      redirect('/auth/login');
    }

    // Connect to database
    await connectToDatabase();

    // Fetch user data with wallet balances
    user = await User.findById(session.user.id)
      .select('wallets');

    if (!user) {
      throw new Error('User not found');
    }

  } catch (error) {
    console.error('Account Page Error:', error);
    
    // Return error UI without throwing to prevent page crash
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold">My Account</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's a summary of your account activity.
          </p>
        </div>
        
        <div className="p-4 text-red-500 bg-red-50 rounded-lg">
          <h2 className="font-bold">Error Loading Account Data</h2>
          <p>
            {error instanceof Error ? error.message : 'An unknown error occurred'}
          </p>
          <p className="text-sm mt-2">
            Please try refreshing the page or contact support if the problem persists.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">My Account</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's a summary of your account activity.
        </p>
      </div>
      
      <DashboardSummary />
      
      <div className="my-5">
        <WalletDisplay wallets={user.wallets} />
      </div>
      
      <Separator />
      <PendingReviews />
      <Separator />
      <OrderHistory />
    </div>
  );
}