"use client"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const earningsData = [
  { month: 'Jan', earnings: 4000 },
  { month: 'Feb', earnings: 3000 },
  { month: 'Mar', earnings: 5000 },
  { month: 'Apr', earnings: 2780 },
  { month: 'May', earnings: 1890 },
  { month: 'Jun', earnings: 2390 },
]

export default function EarningsPage() {
  return (
    <>
      <header className="bg-white shadow-sm p-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Earnings</h2>
        </div>
      </header>

      <main className="p-6">
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h3 className="text-lg font-semibold mb-4">Earnings Overview</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={earningsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="earnings" fill="#eab308" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">June 15, 2023</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">₦5,000</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-500">Paid</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">May 15, 2023</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">₦4,200</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-500">Paid</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </>
  )
}