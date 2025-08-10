import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  isReviewed: {
    type: Boolean,
    default: false
  }
});

const shippingInfoSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  zip: {
    type: String,
  }
});

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  shippingInfo: shippingInfoSchema,
  items: [orderItemSchema],
  reviewId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review'
  },
  isReviewed: {
    type: Boolean,
    default: false
  },
  deliveryMethod: {
    type: String,
    required: true,
    enum: ['standard', 'express']
  },
  deliveryPrice: {
    type: Number,
    required: true,
    default: 0
  },
  subtotal: {
    type: Number,
    required: true
  },
  total: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['cash_wallet', 'food_wallet', 'gadget_wallet', 'bank_transfer', 'card', 'pay_on_delivery']
  },
  paymentStatus: {
    type: String,
    required: true,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  orderStatus: {
    type: String,
    required: true,
    enum: ['processing', 'shipped', 'delivered', 'cancelled'],
    default: 'processing'
  },
  walletBalanceUsed: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

export default mongoose.models.Order || mongoose.model('Order', orderSchema);