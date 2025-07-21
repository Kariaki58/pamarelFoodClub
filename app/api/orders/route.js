import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/dbConnect';
import Order from '@/models/order';
import { getServerSession } from 'next-auth';
import Product from '@/models/product';
import { authOptions } from '../auth/options';
import User from '@/models/user';

export async function GET(request) {
  try {
    await connectToDatabase();
    
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get('status') || 'all';
    
    // Build the query
    let query = { user: session.user.id };
    if (statusFilter !== 'all') {
      query.orderStatus = statusFilter;
    }
    
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .populate('items.product');
    
    return NextResponse.json(orders);
    
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    await connectToDatabase();
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();

    console.log(body)
    const { shippingInfo, items, deliveryMethod, deliveryPrice, subtotal, total } = body;
    
    for (const item of items) {
      const product = await Product.findById(item.product);

      if (!product) {
        return NextResponse.json({ message: `Product not found: ${item.name}` }, { status: 404 });
      }

      if (product.stock < item.quantity) {
        return NextResponse.json({
          message: `Insufficient stock for product: ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`
        }, { status: 400 });
      }
    }

    // Verify wallet balance if paying with wallet
    if (body.paymentMethod === 'cash_wallet') {
        console.log(session.user.id)
      const Userwallet = await User.findOne({ _id: session.user.id });
      console.log(Userwallet)
      const cashBalance = Userwallet?.wallets?.cash || 0;

      if (cashBalance < total) {
        return NextResponse.json(
          { message: 'Insufficient wallet balance' },
          { status: 400 }
        );
      }

      Userwallet.wallets.cash -= total;
      await Userwallet.save();
    }

    // Create new order
    const order = new Order({
      user: session.user.id,
      shippingInfo,
      items,
      deliveryMethod,
      deliveryPrice,
      subtotal,
      total,
      paymentMethod: body.paymentMethod,
      paymentStatus: body.paymentMethod === 'cash_wallet' ? 'paid' : 'pending',
      walletBalanceUsed: body.paymentMethod === 'cash_wallet' ? total : 0
    });

    await order.save();

    return NextResponse.json(
      { 
        message: 'Order created successfully',
        order 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}