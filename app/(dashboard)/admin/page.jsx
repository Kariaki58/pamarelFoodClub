import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { SectionCards } from "@/components/section-cards";
import Transactions from "@/components/transaction";
import WalletDisplay from '@/components/wallets/Wallet';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/options";
import connectToDatabase from "@/lib/dbConnect";
import User from "@/models/user";
import { redirect } from "next/navigation";


export default async function Page() {
  try {
    // Get the user session
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      redirect('/auth/signin');
    }

    // Connect to database
    await connectToDatabase();

    // Fetch user data with wallet balances
    const user = await User.findById(session.user.id)
      .select('wallets');

    if (!user) {
      throw new Error('User not found');
    }

    return (
      <>
        <SectionCards />
        <div className='my-5'>
          <WalletDisplay wallets={JSON.parse(JSON.stringify(user.wallets))} />
        </div>
        
        <div className="px-4 lg:px-6 py-5">
          <ChartAreaInteractive />
        </div>
        <Transactions />
      </>
    );

  } catch (error) {
    console.error('Dashboard Error:', error);
    
    // Handle different error types appropriately
    if (error instanceof Error) {
      return (
        <div className="p-4 text-red-500 bg-red-50 rounded-lg mx-4 my-6">
          <h2 className="font-bold">Error Loading Dashboard</h2>
          <p>{error.message}</p>
          <p className="text-sm mt-2">
            Please try refreshing the page or contact support if the problem persists.
          </p>
        </div>
      );
    }

    return (
      <div className="p-4 text-red-500 bg-red-50 rounded-lg mx-4 my-6">
        <h2 className="font-bold">Unexpected Error</h2>
        <p>An unknown error occurred while loading the dashboard.</p>
      </div>
    );
  }
}