import RecentActivity from '@/components/RecentActivity'
import StatsCard from '@/components/StatsCard'

export default function AffiliateDashboard() {
  const stats = [
    { title: 'Total Earnings', value: '₦25,400', change: '+12%' },
    { title: 'Referrals', value: '42', change: '+5' },
    { title: 'Conversion Rate', value: '18%', change: '+2%' }
  ]

  const activities = [
    { type: 'New referral signup', details: 'John Doe', time: '2 hours ago' },
    { type: 'Commission earned', details: '₦1,200', time: '1 day ago' },
    { type: 'Payout processed', details: '₦10,000', time: '3 days ago' }
  ]

  return (
    <>
      <header className="bg-white shadow-sm p-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Affiliate Overview</h2>
          <div className="flex items-center space-x-4">
            <button className="text-sm bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg transition-colors">
              Share Referral Link
            </button>
          </div>
        </div>
      </header>

      <main className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {stats.map((stat, index) => (
            <StatsCard key={index} {...stat} />
          ))}
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          <RecentActivity activities={activities} />
        </div>
      </main>
    </>
  )
}