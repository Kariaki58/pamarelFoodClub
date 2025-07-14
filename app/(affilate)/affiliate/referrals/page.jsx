"use client"
import { useState } from 'react'
import ReferralTable from "@/components/ReferralTable"

const referrals = [
  { id: 1, name: 'John Doe', email: 'john@example.com', date: '2023-06-15', status: 'Active', earnings: '₦1,200' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', date: '2023-06-10', status: 'Pending', earnings: '₦0' },
  { id: 3, name: 'Robert Johnson', email: 'robert@example.com', date: '2023-05-28', status: 'Active', earnings: '₦2,500' },
]

// Example product URLs
const exampleProducts = [
  { id: 'p1', name: 'Premium Wireless Headphones', url: 'https://example.com/products/p1' },
  { id: 'p2', name: 'Smart Fitness Watch', url: 'https://example.com/products/p2' }
]

export default function ReferralsPage() {
  const [productUrl, setProductUrl] = useState('')
  const [generatedLinks, setGeneratedLinks] = useState([])
  const [copied, setCopied] = useState(false)

  const generateReferralLink = () => {
    if (!productUrl) return
    
    // Extract product ID from URL
    const productId = productUrl.split('/').pop()
    const referralLink = `https://example.com/ref/yourusername?product=${productId}`
    
    // Find product name
    const product = exampleProducts.find(p => p.id === productId) || 
                   { name: 'Custom Product', url: productUrl }
    
    setGeneratedLinks(prev => [
      {
        id: Date.now(),
        productName: product.name,
        productUrl: product.url,
        referralLink,
        date: new Date().toISOString().split('T')[0]
      },
      ...prev
    ])
    
    setProductUrl('')
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <header className="bg-white shadow-sm p-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Referrals</h2>
          <div className="flex items-center space-x-4">
            <button className="text-sm bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg transition-colors">
              Invite Friends
            </button>
          </div>
        </div>
      </header>

      <main className="p-6">
        <div className="bg-white p-6 rounded-lg shadow">
          {/* General Referral Link */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold">Your General Referral Link</h3>
            <div className="mt-2 flex">
              <input 
                type="text" 
                value="https://example.com/ref/yourusername" 
                readOnly 
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
              />
              <button 
                onClick={() => copyToClipboard('https://example.com/ref/yourusername')}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-r-md"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Product-Specific Referral Links */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Generate Product Referral Link</h3>
            <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
              <input
                type="text"
                value={productUrl}
                onChange={(e) => setProductUrl(e.target.value)}
                placeholder="Paste product URL (e.g., https://example.com/products/p1)"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
              />
              <button
                onClick={generateReferralLink}
                disabled={!productUrl}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Generate Link
              </button>
            </div>
            
            {/* Example Product URLs for testing */}
            <div className="mt-4">
              <p className="text-sm text-gray-500 mb-2">Try these example product URLs:</p>
              <div className="space-y-2">
                {exampleProducts.map(product => (
                  <div key={product.id} className="flex items-center">
                    <span className="text-sm bg-gray-100 px-2 py-1 rounded mr-2">{product.name}</span>
                    <button 
                      onClick={() => setProductUrl(product.url)}
                      className="text-xs text-blue-500 hover:underline"
                    >
                      Use this URL
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Generated Links List */}
          {generatedLinks.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Your Generated Links</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Referral Link</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {generatedLinks.map(link => (
                      <tr key={link.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium">{link.productName}</div>
                          <div className="text-sm text-gray-500">{link.productUrl}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {link.referralLink}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {link.date}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => copyToClipboard(link.referralLink)}
                            className="text-yellow-600 hover:text-yellow-900"
                          >
                            Copy
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Referral Table */}
          <h3 className="text-lg font-semibold mt-6 mb-4">Your Referrals</h3>
          <ReferralTable referrals={referrals} />
        </div>
      </main>
    </>
  )
}