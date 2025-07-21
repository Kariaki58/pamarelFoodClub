import mongoose from 'mongoose';

const specificationSchema = new mongoose.Schema({
  key: String,
  value: String,
});

const imageSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
  },
  publicId: {
    type: String,
    required: true,
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
  altText: String,
});

const flashSaleSchema = new mongoose.Schema({
  start: Date,
  end: Date,
  discountPercent: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
});

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    section: {
      type: String,
      required: true,
      enum: ['food', 'gadget'],
      default: 'food'
    },
    specifications: [specificationSchema],
    images: [imageSchema],
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    unitsSold: {
      type: Number,
      default: 0,
      min: 0,
    },
    percentOff: {
      type: Number,
      default: 0,
      min: 0,
    },
    tags: {
      type: [String],
      default: [],
    },
    isTopDeal: {
      type: Boolean,
      default: false,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    flashSale: flashSaleSchema,
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    metadata: {
      views: {
        type: Number,
        default: 0,
      },
      purchases: {
        type: Number,
        default: 0,
      },
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

productSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  if (!this.slug) {
    this.slug = this.name.toLowerCase().replace(/ /g, '-');
  }
  next();
});

productSchema.index({
  name: 'text',
  description: 'text',
  'specifications.value': 'text',
});

productSchema.virtual('averageRating').get(function () {
  if (this.numReviews === 0) return 0;
  return this.rating / this.numReviews;
});

export default mongoose.models.Product || mongoose.model('Product', productSchema);