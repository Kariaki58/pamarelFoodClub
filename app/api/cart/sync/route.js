import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/dbConnect';
import Cart from '@/models/cart';
import Product from '@/models/product';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/options';

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

    const { items: localCartItems } = await req.json();
    const userId = session.user.id;

    // Validate input
    if (!Array.isArray(localCartItems)) {
      return NextResponse.json(
        { message: 'Invalid cart data format' },
        { status: 400 }
      );
    }

    // Find or create user's cart
    let cart = await Cart.findOne({ user: userId }).populate('items.product');

    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }


    // Merge local cart with database cart
    for (const localItem of localCartItems) {
      if (!localItem?.id || !localItem?.quantity) {
        continue;
      }

      const product = await Product.findById(localItem.id);
      if (!product) continue;

      const existingItem = cart.items.find(item => 
        item.product._id.toString() === localItem.id
      );

      if (existingItem) {
        // Use the greater quantity between local and database
        existingItem.quantity = Math.max(
          existingItem.quantity,
          localItem.quantity
        );
        existingItem.price = product.price; // Update to current price
      } else {
        cart.items.push({
          product: localItem.id,
          quantity: localItem.quantity,
          section: localItem.section,
          price: product.price
        });
      }
    }

    await cart.save();
    
    return NextResponse.json({
      message: 'Cart synced successfully',
      items: cart.items.map(item => ({
        id: item.product._id.toString(),
        name: item.product.name,
        price: item.price,
        imageUrl: item.product.images?.find(img => img.isDefault)?.url || 
                 item.product.images?.[0]?.url,
        quantity: item.quantity
      }))
    });

  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}