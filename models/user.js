import mongoose from 'mongoose';

// Helper function to generate unique referral code
async function generateUniqueReferralCode(username) {
  let randomSuffix = Math.floor(1000 + Math.random() * 9000); // 4-digit random number
  let referralCode = `${username.slice(0, 3)}${randomSuffix}`.toUpperCase();
  
  // Check if code exists and regenerate if needed
  let exists = true;
  let attempts = 0;
  const maxAttempts = 5;
  
  while (exists && attempts < maxAttempts) {
    const user = await mongoose.model('User').findOne({ referralCode });
    exists = !!user;
    if (exists) {
      randomSuffix = Math.floor(1000 + Math.random() * 9000);
      referralCode = `${username.slice(0, 3)}${randomSuffix}`.toUpperCase();
      attempts++;
    }
  }
  
  return referralCode;
}

const userSchema = new mongoose.Schema({
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

  // Updated Board Progress - Starts with basic
  currentBoard: {
    type: String,
    enum: ['basic', 'bronze', 'silver', 'gold', 'platinum'],
    default: 'basic'
  },
  boardProgress: {
    basic: {
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
      level2Recruited: { type: Number, default: 0 }  // Indirect (your downlines' downlines)
    },
    gold: { 
      completed: { type: Boolean, default: false },
      completionDate: Date,
      level1Recruited: { type: Number, default: 0 }, // Direct
      level2Recruited: { type: Number, default: 0 }  // Indirect
    },
    platinum: { 
      completed: { type: Boolean, default: false },
      completionDate: Date,
      level1Recruited: { type: Number, default: 0 }, // Direct
      level2Recruited: { type: Number, default: 0 }, // Indirect
      level3Recruited: { type: Number, default: 0 }  // 3rd level
    }
  },

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


userSchema.pre('save', async function(next) {
  if (!this.referralCode) {
    this.referralCode = await generateUniqueReferralCode(this.username);
  }
  next();
});


// Board Qualification Methods
userSchema.methods.checkBronzeQualification = function() {
  return this.boardProgress.basic.membersRecruited >= 7;
};

userSchema.methods.checkSilverQualification = function() {
  return (
    this.currentBoard === 'bronze' &&
    this.boardProgress.bronze.membersRecruited >= 7 &&
    this.directDownlines.length >= 7 &&
    this.networkDownlines.length >= 49 // 7x7 structure
  );
};

userSchema.methods.checkGoldQualification = function() {
  return (
    this.currentBoard === 'silver' &&
    this.boardProgress.silver.level1Recruited >= 7 &&
    this.boardProgress.silver.level2Recruited >= 49 &&
    this.directDownlines.filter(d => d.currentBoard === 'silver').length >= 7
  );
};

userSchema.methods.checkPlatinumQualification = function() {
  return (
    this.currentBoard === 'gold' &&
    this.boardProgress.gold.level1Recruited >= 7 &&
    this.boardProgress.gold.level2Recruited >= 49 &&
    this.directDownlines.filter(d => d.currentBoard === 'gold').length >= 7
  );
};

// Promotion Methods
userSchema.methods.promoteToBronze = function() {
  if (this.checkBronzeQualification() && this.currentBoard === 'basic') {
    this.currentBoard = 'bronze';
    this.boardProgress.bronze = {
      completed: true,
      completionDate: new Date(),
      membersRecruited: this.boardProgress.basic.membersRecruited
    };
    return true;
  }
  return false;
};

userSchema.methods.promoteToSilver = function() {
  if (this.checkSilverQualification() && this.currentBoard === 'bronze') {
    this.currentBoard = 'silver';
    this.boardProgress.silver = {
      completed: true,
      completionDate: new Date(),
      level1Recruited: this.directDownlines.length,
      level2Recruited: this.networkDownlines.length
    };
    return true;
  }
  return false;
};

userSchema.methods.promoteToGold = function() {
  if (this.checkGoldQualification() && this.currentBoard === 'silver') {
    this.currentBoard = 'gold';
    this.boardProgress.gold = {
      completed: true,
      completionDate: new Date(),
      level1Recruited: this.boardProgress.silver.level1Recruited,
      level2Recruited: this.boardProgress.silver.level2Recruited
    };
    return true;
  }
  return false;
};

userSchema.methods.promoteToPlatinum = function() {
  if (this.checkPlatinumQualification() && this.currentBoard === 'gold') {
    this.currentBoard = 'platinum';
    this.boardProgress.platinum = {
      completed: true,
      completionDate: new Date(),
      level1Recruited: this.boardProgress.gold.level1Recruited,
      level2Recruited: this.boardProgress.gold.level2Recruited,
      level3Recruited: this.networkDownlines.reduce((acc, downline) => {
        return acc + (downline.networkDownlines?.length || 0);
      }, 0)
    };
    return true;
  }
  return false;
};

// Method to add new recruit with automatic promotions
userSchema.methods.addRecruit = async function(recruitId, isDirect = true) {
  if (isDirect) {
    if (!this.directDownlines.includes(recruitId)) {
      this.directDownlines.push(recruitId);
    }
    
    // Update counts based on current board
    switch(this.currentBoard) {
      case 'basic':
        this.boardProgress.basic.membersRecruited += 1;
        if (this.checkBronzeQualification()) await this.promoteToBronze();
        break;
      case 'bronze':
        this.boardProgress.bronze.membersRecruited += 1;
        if (this.checkSilverQualification()) await this.promoteToSilver();
        break;
      case 'silver':
        this.boardProgress.silver.level1Recruited += 1;
        if (this.checkGoldQualification()) await this.promoteToGold();
        break;
      case 'gold':
        this.boardProgress.gold.level1Recruited += 1;
        if (this.checkPlatinumQualification()) await this.promoteToPlatinum();
        break;
      case 'platinum':
        this.boardProgress.platinum.level1Recruited += 1;
        break;
    }
  } else {
    if (!this.networkDownlines.includes(recruitId)) {
      this.networkDownlines.push(recruitId);
    }
    
    // Update indirect recruitment counts
    switch(this.currentBoard) {
      case 'silver':
        this.boardProgress.silver.level2Recruited += 1;
        if (this.checkGoldQualification()) await this.promoteToGold();
        break;
      case 'gold':
        this.boardProgress.gold.level2Recruited += 1;
        if (this.checkPlatinumQualification()) await this.promoteToPlatinum();
        break;
      case 'platinum':
        this.boardProgress.platinum.level2Recruited += 1;
        break;
    }
  }
  
  await this.save();
};

const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;