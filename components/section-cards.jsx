"use client";
import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useEffect, useState } from "react";

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

const WalletCard = () => {
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [growthRate, setGrowthRate] = useState(0);

  useEffect(() => {
    const fetchWalletBalance = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/paystack/balance');
        
        if (!response.ok) {
          throw new Error('Failed to fetch wallet balance');
        }

        const data = await response.json();
        setBalance(data.balance);
        setGrowthRate(data.growthRate);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWalletBalance();
  }, []);

  if (loading) return <div className="text-sm text-gray-500">Loading wallet...</div>;
  if (error) return <div className="text-sm text-red-500">{error}</div>;

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardDescription>Wallet Balance</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
          {formatCurrency(balance)}
        </CardTitle>
        <CardAction>
          <Badge variant="outline" className="flex items-center gap-1">
            {growthRate > 0 ? (
              <IconTrendingUp className="size-3" />
            ) : (
              <IconTrendingDown className="size-3" />
            )}
            {growthRate > 0 ? '+' : ''}{growthRate}%
          </Badge>
        </CardAction>
      </CardHeader>
      <CardFooter className="flex-col items-start gap-1.5 text-sm">
        <div className="line-clamp-1 flex items-center gap-2 font-medium">
          {growthRate > 0 ? (
            <>
              <span>Growing steadily</span>
              <IconTrendingUp className="size-4 text-green-500" />
            </>
          ) : (
            <>
              <span>Decreased balance</span>
              <IconTrendingDown className="size-4 text-red-500" />
            </>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export function SectionCards() {
  const [stats, setStats] = useState({
    totalMembers: 0,
    membersWithoutPlan: 0,
    totalRevenue: 0,
    revenueGrowth: 0,
    membersGrowth: 0,
    noPlanGrowth: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/stats');
        
        if (!response.ok) {
          throw new Error('Failed to fetch statistics');
        }

        const data = await response.json();
        setStats(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <div className="text-sm text-gray-500">Loading statistics...</div>;
  if (error) return <div className="text-sm text-red-500">{error}</div>;

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Revenue</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatCurrency(stats.totalRevenue)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="flex items-center gap-1">
              {stats.revenueGrowth > 0 ? (
                <IconTrendingUp className="size-3" />
              ) : (
                <IconTrendingDown className="size-3" />
              )}
              {stats.revenueGrowth > 0 ? '+' : ''}{stats.revenueGrowth}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {stats.revenueGrowth > 0 ? (
              <>
                Trending up this month <IconTrendingUp className="size-4 text-green-500" />
              </>
            ) : (
              <>
                Revenue decreased <IconTrendingDown className="size-4 text-red-500" />
              </>
            )}
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Members</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.totalMembers.toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="flex items-center gap-1">
              {stats.membersGrowth > 0 ? (
                <IconTrendingUp className="size-3" />
              ) : (
                <IconTrendingDown className="size-3" />
              )}
              {stats.membersGrowth > 0 ? '+' : ''}{stats.membersGrowth}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {stats.membersGrowth > 0 ? (
              <>
                Network growing <IconTrendingUp className="size-4 text-green-500" />
              </>
            ) : (
              <>
                Membership decline <IconTrendingDown className="size-4 text-red-500" />
              </>
            )}
          </div>
        </CardFooter>
      </Card>
      <WalletCard />
    </div>
  );
}
