"use client"
import Sidebar from '@/components/Sidebar'
import { useState } from 'react'

export default function AffiliateLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)


  console.log("looooooode")
  const isAdmin = session?.user?.role === 'admin' 


  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} isAdmin={isAdmin}/>
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  )
}