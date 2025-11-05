import { NextResponse } from 'next/server'
import connectToDatabase from '@/lib/dbConnect'
import Order from '@/models/order'
import { getServerSession } from 'next-auth'
import Product from '@/models/product'
import { authOptions } from '../auth/options'
import User from '@/models/user'


export async function GET(request) {
  try {
    await connectToDatabase()

    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const statusFilter = searchParams.get('status') || 'all'

    let query = { user: session.user.id }
    if (statusFilter !== 'all') query.orderStatus = statusFilter

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .populate('items.product')

    return NextResponse.json(orders)
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    await connectToDatabase()
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const {
      shippingInfo,
      items,
      deliveryMethod,
      deliveryPrice,
      subtotal,
      total,
      paymentMethod,
    } = body

    // ✅ Validate products and stock
    for (const item of items) {
      const product = await Product.findById(item.product)
      if (!product) {
        return NextResponse.json({ message: `Product not found: ${item.name}` }, { status: 404 })
      }

      if (product.stock < item.quantity) {
        return NextResponse.json(
          { message: `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}` },
          { status: 400 }
        )
      }
    }

    // ✅ Deduct from wallet if wallet payment
    const user = await User.findById(session.user.id)
    if (!user) return NextResponse.json({ message: 'User not found' }, { status: 404 })

    if (paymentMethod === 'cash_wallet') {
      const cash = user?.earnings?.cashWallet || 0
      if (cash < total) return NextResponse.json({ message: 'Insufficient wallet balance' }, { status: 400 })
      user.earnings.cashWallet -= total
    }

    if (paymentMethod === 'food_wallet') {
      const food = user?.earnings?.foodWallet || 0
      if (food < total) return NextResponse.json({ message: 'Insufficient wallet balance' }, { status: 400 })
      user.earnings.foodWallet -= total
    }

    if (paymentMethod === 'gadget_wallet') {
      const gadget = user?.earnings?.gadgetsWallet || 0
      if (gadget < total) return NextResponse.json({ message: 'Insufficient wallet balance' }, { status: 400 })
      user.earnings.gadgetsWallet -= total
    }

    await user.save()

    // ✅ Build order items safely for schema
    const orderItems = items.map((item) => ({
      product: item.product,
      name: item.name,
      price: item.price || item.discountedPrice,
      quantity: item.quantity,
      imageUrl: item.image || item.imageUrl || '',
      selectedVariants: item.selectedVariants || {},
      variantSku: item.variantSku || '',
    }))

    // ✅ Create order
    const order = new Order({
      user: session.user.id,
      shippingInfo,
      items: orderItems,
      deliveryMethod,
      deliveryPrice,
      subtotal,
      total,
      paymentMethod,
      paymentStatus: 'paid',
      orderStatus: 'processing',
      walletBalanceUsed: ['cash_wallet', 'food_wallet', 'gadget_wallet'].includes(paymentMethod)
        ? total
        : 0,
    })

    await order.save()

    // ✅ Reduce product stock
    for (const item of items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      })
    }

    return NextResponse.json(
      { message: 'Order created successfully', order },
      { status: 201 }
    )
  } catch (error) {
    console.error('Order creation error:', error)
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
