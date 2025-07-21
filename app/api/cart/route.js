import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/dbConnect';
import Cart from '@/models/cart';
import Product from '@/models/product';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/options';

// GET - Get user's cart
export async function GET() {
  try {
    await connectToDatabase();
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const cart = await Cart.findOne({ user: session.user.id })
      .populate({
        path: 'items.product',
        select: 'name images price'
      })
      .lean();

    if (!cart) {
      return NextResponse.json({ items: [] });
    }

    const formattedItems = cart.items.map(item => ({
      id: item.product._id.toString(),
      name: item.product.name,
      price: item.price || item.product.price,
      imageUrl: item.product.images?.find(img => img.isDefault)?.url || 
               item.product.images?.[0]?.url,
      quantity: item.quantity
    }));

    return NextResponse.json(formattedItems);

  } catch (error) {
    console.error('Cart fetch error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Add item to cart
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

    const { productId, quantity = 1 } = await req.json();
    const userId = session.user.id;

    // Validate quantity
    if (quantity < 1) {
      return NextResponse.json(
        { message: 'Quantity must be at least 1' },
        { status: 400 }
      );
    }

    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json(
        { message: 'Product not found' },
        { status: 404 }
      );
    }

    let cart = await Cart.findOne({ user: userId });
    
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    const existingItemIndex = cart.items.findIndex(item => 
      item.product.toString() === productId
    );

    if (existingItemIndex >= 0) {
      // Update existing item's quantity
      cart.items[existingItemIndex].quantity += quantity;
      cart.items[existingItemIndex].price = product.price;
    } else {
      // Add new item
      cart.items.push({
        product: productId,
        quantity,
        price: product.price
      });
    }

    await cart.save();
    
    // Return the updated cart
    const updatedCart = await Cart.findById(cart._id)
      .populate({
        path: 'items.product',
        select: 'name images price'
      })
      .lean();

    const formattedItems = updatedCart.items.map(item => ({
      id: item.product._id.toString(),
      name: item.product.name,
      price: item.price || item.product.price,
      imageUrl: item.product.images?.find(img => img.isDefault)?.url || 
               item.product.images?.[0]?.url,
      quantity: item.quantity
    }));

    return NextResponse.json({
      message: existingItemIndex >= 0 ? 'Cart item updated' : 'Item added to cart',
      items: formattedItems
    });

  } catch (error) {
    console.error('Add to cart error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update item quantity
export async function PUT(req) {
  try {
    await connectToDatabase();
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { productId, quantity } = await req.json();
    const userId = session.user.id;

    if (!productId || quantity === undefined) {
      return NextResponse.json(
        { message: 'Product ID and quantity are required' },
        { status: 400 }
      );
    }

    const cart = await Cart.findOne({ user: userId });
    
    if (!cart) {
      return NextResponse.json(
        { message: 'Cart not found' },
        { status: 404 }
      );
    }

    const itemToUpdate = cart.items.find(item => 
      item.product.toString() === productId
    );

    if (!itemToUpdate) {
      return NextResponse.json(
        { message: 'Item not found in cart' },
        { status: 404 }
      );
    }

    if (quantity <= 0) {
      // Remove item if quantity is 0 or less
      cart.items = cart.items.filter(item => 
        item.product.toString() !== productId
      );
    } else {
      itemToUpdate.quantity = quantity;
    }

    await cart.save();
    
    return NextResponse.json({
      message: quantity <= 0 ? 'Item removed from cart' : 'Cart updated',
      items: cart.items
    });

  } catch (error) {
    console.error('Cart update error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Remove item or clear cart
export async function DELETE(req) {
  try {
    await connectToDatabase();
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');
    const userId = session.user.id;

    const cart = await Cart.findOne({ user: userId });
    
    if (!cart) {
      return NextResponse.json(
        { message: 'Cart not found' },
        { status: 404 }
      );
    }

    if (productId) {
      // Remove specific item
      cart.items = cart.items.filter(item => 
        item.product.toString() !== productId
      );
    } else {
      // Clear entire cart
      cart.items = [];
    }

    await cart.save();
    console.log("here line 245")
    
    return NextResponse.json({
      message: productId ? 'Item removed from cart' : 'Cart cleared',
      items: cart.items
    });

  } catch (error) {
    console.error('Cart deletion error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}