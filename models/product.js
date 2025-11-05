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

const variantTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  values: [String],
});

const variantSchema = new mongoose.Schema({
  combination: {
    type: Map,
    of: String,
    required: true,
  },
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
  sku: {
    type: String,
    required: true,
    unique: true,
  },
  image: {
    url: String,
    publicId: String,
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
    basePrice: {
      type: Number,
      required: true,
      min: 0,
    },
    variantTypes: [variantTypeSchema],
    variants: [variantSchema],
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

// Virtual for total stock (sum of all variants)
productSchema.virtual('totalStock').get(function () {
  if (this.variants && this.variants.length > 0) {
    return this.variants.reduce((total, variant) => total + variant.stock, 0);
  }
  return 0;
});

// Virtual for minimum variant price
productSchema.virtual('minPrice').get(function () {
  if (this.variants && this.variants.length > 0) {
    return Math.min(...this.variants.map(variant => variant.price));
  }
  return this.basePrice;
});

// Virtual for maximum variant price
productSchema.virtual('maxPrice').get(function () {
  if (this.variants && this.variants.length > 0) {
    return Math.max(...this.variants.map(variant => variant.price));
  }
  return this.basePrice;
});

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