
"use client";

import { useParams, notFound, useRouter } from 'next/navigation';
import { orders } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import { formatPrice } from '@/lib/utils';
import { Truck, Package, PackageCheck, FileText, ArrowLeft, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const statusMap = {
    'Pending': { icon: <Package className="h-5 w-5" />, text: 'Order Placed', color: 'text-gray-500', step: 0 },
    'Shipped': { icon: <Truck className="h-5 w-5" />, text: 'Order Shipped', color: 'text-blue-500', step: 1 },
    'Delivered': { icon: <PackageCheck className="h-5 w-5" />, text: 'Order Delivered', color: 'text-green-500', step: 2 },
    'Cancelled': { icon: <XCircle className="h-5 w-5" />, text: 'Order Cancelled', color: 'text-red-500', step: -1 },
};

export default function OrderDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const { id } = params;
    const order = orders.find(o => o.id === id);

    if (!order) {
        return notFound();
    }

    const timelineStatuses = ['Pending', 'Shipped', 'Delivered'];
    const currentStatusIndex = statusMap[order.status].step;

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                 <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                    <span className="sr-only">Back to orders</span>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">Order Details</h1>
                    <p className="text-muted-foreground">Order ID: {order.id}</p>
                </div>
            </div>

             <Card>
                <CardHeader>
                    <CardTitle>Order Status</CardTitle>
                </CardHeader>
                <CardContent>
                    {order.status === 'Cancelled' ? (
                         <div className="flex items-center gap-3 text-red-500">
                            {statusMap['Cancelled'].icon}
                            <p className="text-lg font-semibold">{statusMap['Cancelled'].text}</p>
                         </div>
                    ) : (
                        <div className="relative pt-4">
                            <div className="absolute left-4 top-6 h-[calc(100%-3rem)] w-0.5 bg-gray-200 dark:bg-gray-700" />
                            {timelineStatuses.map((status, index) => (
                                <div key={status} className="relative z-10 flex items-start gap-4 mb-8 last:mb-0">
                                    <div className={cn(
                                        "flex h-8 w-8 items-center justify-center rounded-full shrink-0",
                                        index <= currentStatusIndex ? 'bg-primary text-primary-foreground' : 'bg-gray-200 text-gray-500 dark:bg-gray-700'
                                    )}>
                                        {statusMap[status].icon}
                                    </div>
                                    <div>
                                        <p className={cn(
                                            "font-medium",
                                            index <= currentStatusIndex ? 'text-foreground' : 'text-muted-foreground'
                                        )}>{statusMap[status].text}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {index === 0 && `Your order was placed on ${new Date(order.orderDate).toLocaleDateString()}`}
                                            {index === 1 && order.shippedDate && `Your order was shipped on ${new Date(order.shippedDate).toLocaleDateString()}`}
                                            {index === 2 && order.deliveredDate && `Your order was delivered on ${new Date(order.deliveredDate).toLocaleDateString()}`}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                <div className="md:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Items Ordered ({order.items.length})</CardTitle>
                        </CardHeader>
                        <CardContent className="divide-y">
                            {order.items.map(item => (
                                <div key={item.id} className="flex items-center gap-4 py-4">
                                    <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md">
                                        <Image src={item.imageUrl} alt={item.name} fill className="object-cover" data-ai-hint="product image" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold">{item.name}</h3>
                                        <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold">₦{formatPrice(item.price * item.quantity)}</p>
                                        <p className="text-sm text-muted-foreground">₦{formatPrice(item.price)} each</p>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
                <div className="space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Shipping Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <p className="font-medium">{order.shippingAddress.name}</p>
                            <p className="text-muted-foreground">{order.shippingAddress.address}</p>
                            <p className="text-muted-foreground">{order.shippingAddress.city}, {order.shippingAddress.zip}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Order Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <p>Subtotal</p>
                                <p>₦{formatPrice(order.totalAmount - order.shippingCost)}</p>
                            </div>
                            <div className="flex justify-between">
                                <p>Shipping</p>
                                <p>₦{formatPrice(order.shippingCost)}</p>
                            </div>
                             <Separator />
                            <div className="flex justify-between font-bold text-base">
                                <p>Total</p>
                                <p>₦{formatPrice(order.totalAmount)}</p>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button variant="outline" className="w-full">
                                <FileText className="mr-2 h-4 w-4" />
                                Download Invoice
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
}
