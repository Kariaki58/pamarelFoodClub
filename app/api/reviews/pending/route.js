import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/options";
import connectToDatabase from "@/lib/dbConnect";
import Order from "@/models/order";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new Response(JSON.stringify({
        success: false,
        message: "Unauthorized"
      }), { status: 401 });
    }

    await connectToDatabase();


    const orders = await Order.find({
      user: session.user.id,
      orderStatus: 'delivered'
    }).populate({
      path: 'items.product',
      select: 'name images'
    });

    const pendingReviews = orders.flatMap(order => 
      order.items
        .filter(item => !item.isReviewed)
        .map(item => ({
          orderId: order._id,
          itemId: item._id,
          product: {
            id: item.product._id,
            name: item.product.name,
            imageUrl: item.product.images.find(img => img.isDefault)?.url || item.product.images[0]?.url
          }
        }))
    );

    return new Response(JSON.stringify({
      success: true,
      pendingReviews
    }), { status: 200 });

  } catch (error) {
    console.error("Error fetching pending reviews:", error);
    return new Response(JSON.stringify({
      success: false,
      message: "Failed to fetch pending reviews"
    }), { status: 500 });
  }
}