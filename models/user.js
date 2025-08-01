import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  // Basic Information
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [20, 'Username cannot exceed 20 characters']
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
    trim: true,
  },

  // Authentication
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },

  // MLM Structure
  referralCode: {
    type: String,
    unique: true,
    trim: true
  },
  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  upline: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  directDownlines: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  networkDownlines: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],

  // Board Progress - Starts with no board
  currentBoard: {
    type: String,
    enum: ['basic', 'bronze', 'silver', 'gold', 'platinum'],
    default: 'basic'
  },
  boardProgress: {
    none: {
      membersRecruited: { type: Number, default: 0 }
    },
    bronze: { 
      completed: { type: Boolean, default: false },
      completionDate: Date,
      membersRecruited: { type: Number, default: 0 }
    },
    silver: { 
      completed: { type: Boolean, default: false },
      completionDate: Date,
      level1Recruited: { type: Number, default: 0 }, // Direct
      level2Recruited: { type: Number, default: 0 }  // Indirect (7x7)
    },
    gold: { 
      completed: { type: Boolean, default: false },
      completionDate: Date,
      level1Recruited: { type: Number, default: 0 }, // Direct
      level2Recruited: { type: Number, default: 0 }  // Indirect (7x7)
    },
    platinum: { 
      completed: { type: Boolean, default: false },
      completionDate: Date,
      membersRecruited: { type: Number, default: 0 }
    }
  },

  // Earnings and Rewards
  earnings: {
    total: { type: Number, default: 0 },
    foodWallet: { type: Number, default: 0 },
    gadgetWallet: { type: Number, default: 0 },
    cashWallet: { type: Number, default: 0 },
    bonusWallet: { type: Number, default: 0 }
  },

  // Bank Information
  bankDetails: {
    bankName: { type: String },
    accountName: { type: String },
    accountNumber: { type: String },
    bankCode: { type: String }
  },

  // System Status
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  lastLogin: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Generate referral code before saving
userSchema.pre('save', async function(next) {
  if (!this.referralCode) {
    this.referralCode = await generateUniqueReferralCode(this.username);
  }
  next();
});

// Method to check if user qualifies for Bronze board
userSchema.methods.checkBronzeQualification = function() {
  return this.boardProgress.none.membersRecruited >= 7;
};

// Method to promote to Bronze board
userSchema.methods.promoteToBronze = function() {
  if (this.checkBronzeQualification() && this.currentBoard === 'none') {
    this.currentBoard = 'bronze';
    this.boardProgress.bronze = {
      completed: true,
      completionDate: new Date(),
      membersRecruited: this.boardProgress.none.membersRecruited
    };
    return true;
  }
  return false;
};

// Method to add new recruit
userSchema.methods.addRecruit = async function(recruitId, isDirect = true) {
  if (isDirect) {
    // Add to direct downlines if not already there
    if (!this.directDownlines.includes(recruitId)) {
      this.directDownlines.push(recruitId);
    }
    
    // Update recruitment counts
    if (this.currentBoard === 'none') {
      this.boardProgress.none.membersRecruited += 1;
      
      // Auto-promote to Bronze if qualified
      if (this.checkBronzeQualification()) {
        await this.promoteToBronze();
      }
    }
  } else {
    // Add to network downlines if not already there
    if (!this.networkDownlines.includes(recruitId)) {
      this.networkDownlines.push(recruitId);
    }
  }
  
  await this.save();
};

const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;