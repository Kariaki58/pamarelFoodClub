import { orders } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Banknote, Star, Truck } from "lucide-react";
import { formatPrice } from "@/lib/utils";

export function DashboardSummary() {
    const totalSpent = orders.reduce((acc, order) => acc + order.totalAmount, 0);
    const totalOrders = orders.length;
    const deliveredOrders = orders.filter(o => o.status === 'Delivered').length;
    const pendingReviews = orders
        .filter(o => o.status === 'Delivered')
        .flatMap(o => o.items)
        .filter(item => !item.reviewId).length;

    const summaryData = [
        {
            icon: <Package className="h-6 w-6 text-muted-foreground" />,
            title: "Total Orders",
            value: totalOrders,
        },
        {
            icon: <Banknote className="h-6 w-6 text-muted-foreground" />,
            title: "Total Spent",
            value: `₦${formatPrice(totalSpent)}`,
        },
        {
            icon: <Truck className="h-6 w-6 text-muted-foreground" />,
            title: "Delivered",
            value: deliveredOrders,
        },
        {
            icon: <Star className="h-6 w-6 text-muted-foreground" />,
            title: "Pending Reviews",
            value: pendingReviews,
        },
    ];

    return (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {summaryData.map(item => (
                <Card key={item.title}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
                        {item.icon}
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{item.value}</div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
