import { DashboardSummary } from "@/components/account/dashboard-summary";
import { OrderHistory } from "@/components/account/order-history";
import { PendingReviews } from "@/components/account/pending-reviews";
import { Separator } from "@/components/ui/separator";

export default function AccountPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">My Account</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's a summary of your account activity.
        </p>
      </div>
      <DashboardSummary />
      <Separator />
      <PendingReviews />
      <Separator />
      <OrderHistory />
    </div>
  );
}
