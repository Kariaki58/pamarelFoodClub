import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: props => `${props.value} is not a valid email address`
    }
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    trim: true
  },

  // Authentication
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,

  // MLM Specific Fields
  role: {
    type: String,
    enum: ['admin', 'affiliate'],
    default: 'affiliate'
  },
  referralCode: {
    type: String,
    unique: true,
    trim: true
  },
  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  directDownlines: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  upline: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  genealogyLevel: {
    type: Number,
    default: 0
  },

  // Wallet Information
  wallets: {
    cash: { type: Number, default: 0 },
    gadget: { type: Number, default: 0 },
    food: { type: Number, default: 0 },
    points: { type: Number, default: 0 }
  },

  // Status and Verification
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  verificationToken: String,
  verificationExpires: Date,

  // Profile Information
  profilePhoto: String,
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    postalCode: String
  },
  bankDetails: {
    bankName: String,
    accountName: String,
    accountNumber: String,
    bankCode: String
  },

  // Timestamps
  lastLogin: Date,
  loginCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Generate referral code before saving
userSchema.pre('save', async function(next) {
  if (!this.referralCode) {
    this.referralCode = generateReferralCode(this.firstName, this.lastName);
  }
  next();
});


// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Generate referral code helper function
function generateReferralCode(firstName, lastName) {
  const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${firstName.charAt(0)}${lastName.charAt(0)}${randomChars}`;
}

const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;