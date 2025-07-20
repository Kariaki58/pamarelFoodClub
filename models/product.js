import mongoose from 'mongoose';


const specificationSchema = new mongoose.Schema({
  key: String,
  value: String,
});


const productSchema = new mongoose.Schema({
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
  specifications: [specificationSchema],
  images: [{
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
    altText: String, // Added for SEO
  }],
  status: {
    type: String,
    enum: ['draft', 'active', 'archived'],
    default: 'draft',
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  price: { // Added as it's typically essential
    type: Number,
    required: true,
    min: 0,
  },
  stock: { // Added inventory tracking
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
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
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
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

productSchema.pre('save', function(next) {
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

productSchema.virtual('averageRating').get(function() {
  if (this.numReviews === 0) return 0;
  return this.rating / this.numReviews;
});

export default mongoose.models.Product || mongoose.model('Product', productSchema);