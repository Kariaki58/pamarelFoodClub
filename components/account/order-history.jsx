"use client";

import { useState } from 'react';
import { orders } from '@/lib/mock-data';
import { OrderCard } from './order-card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import Link from 'next/link';


export function OrderHistory({ showAll = false }) {
    const [filter, setFilter] = useState('all');
    
    const filteredOrders = orders
        .filter(order => filter === 'all' || order.status === filter)
        .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());

    const displayedOrders = showAll ? filteredOrders : filteredOrders.slice(0, 3); 

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-baseline mb-6">
                 <h2 className="text-xl font-bold">Order History</h2>
                 <div className="flex items-center gap-2 mt-4 sm:mt-0">
                    <Select value={filter} onValueChange={(value) => setFilter(value)}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter orders" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Orders</SelectItem>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="Shipped">Shipped</SelectItem>
                            <SelectItem value="Delivered">Delivered</SelectItem>
                            <SelectItem value="Cancelled">Cancelled</SelectItem>
                        </SelectContent>
                    </Select>
                 </div>
            </div>
            {displayedOrders.length > 0 ? (
                <div className="space-y-4">
                    {displayedOrders.map(order => (
                        <OrderCard key={order.id} order={order} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-10 border-2 border-dashed rounded-lg">
                    <p className="text-muted-foreground">You have no orders with this status.</p>
                </div>
            )}
             {!showAll && filteredOrders.length > 3 && (
                <div className="mt-8 text-center">
                    <Button asChild variant="outline">
                        <Link href="/account/orders">View All Orders</Link>
                    </Button>
                </div>
             )}
        </div>
    );
}
