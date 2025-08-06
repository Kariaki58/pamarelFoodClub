import mongoose from 'mongoose';
import { PLANS } from "../lib/plans"

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

const boardProgressSchema = new mongoose.Schema({
  boardType: {
    type: String,
    required: true,
    enum: ['bronze', 'silver', 'gold', 'platinum']
  },
  completed: {
    type: Boolean,
    default: false
  },
  completionDate: Date,
  // Track direct referrals (people you personally referred)
  directReferrals: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  // Track indirect referrals (your downline's downlines)
  indirectReferrals: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  rewardsClaimed: {
    type: Boolean,
    default: false
  },
  startDate: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

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
  password: {
    type: String,
    required: [true, "password is required"],
  },

  // Plan Information
  currentPlan: {
    type: String,
    enum: ['basic', 'classic', 'deluxe', null],
    default: null
  },
  planHistory: [{
    planType: {
      type: String,
      enum: ['basic', 'classic', 'deluxe']
    },
    startDate: Date,
    endDate: Date,
    paymentProof: String,
    status: {
      type: String,
      enum: ['active', 'completed', 'cancelled'],
      default: 'active'
    }
  }],
  currentBoard: {
    type: String,
    enum: ['bronze', 'silver', 'gold', 'platinum'],
    default: 'bronze'
  },
  boardProgress: [boardProgressSchema],

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
  // Simplified downline tracking - we'll use board-specific tracking in boardProgress
  downlines: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],

  // Wallets
  wallets: {
    cash: { type: Number, default: 0 },
    food: { type: Number, default: 0 },
    gadget: { type: Number, default: 0 },
    bonus: { type: Number, default: 0 }
  },

  // Transactions
  transactions: [{
    type: { 
      type: String, 
      enum: ['deposit', 'withdrawal', 'transfer', 'bonus', 'earning', 'reward'] 
    },
    amount: Number,
    walletType: {
      type: String,
      enum: ['cash', 'food', 'gadget', 'bonus']
    },
    plan: {
      type: String,
      enum: ['basic', 'classic', 'deluxe']
    },
    board: String,
    description: String,
    reference: String,
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending'
    },
    date: { type: Date, default: Date.now }
  }],

  // Special rewards (non-monetary)
  specialRewards: [{
    board: String,
    items: [String],
    date: Date
  }],

  // System Status
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  lastLogin: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ============== METHODS ============== //

// Plan Activation
// In your User model (models/User.js)
userSchema.methods.activatePlan = async function(planType, paymentProof) {
  if (!['basic', 'classic', 'deluxe'].includes(planType)) {
    throw new Error('Invalid plan type');
  }

  // Update current plan
  this.currentPlan = planType;
  
  // Add to plan history
  this.planHistory.push({
    planType,
    startDate: new Date(),
    paymentProof,
    status: 'active'
  });

  // Initialize board progress if not exists
  if (!this.boardProgress || this.boardProgress.length === 0) {
    this.boardProgress = [{
      boardType: 'bronze',
      completed: false,
      directReferrals: [],
      indirectReferrals: [],
      rewardsClaimed: false,
      startDate: new Date()
    }];
    this.currentBoard = 'bronze';
  }

  await this.save();

  // Process referral if this user was referred
  if (this.referredBy) {
    const referrer = await this.model('User').findById(this.referredBy);
    if (referrer) {
      await referrer.processActivatedReferral(this._id, planType);
    }
  }

  return this;
};


userSchema.methods.processActivatedReferral = async function(newUserId, planType) {
  const currentBoard = this.boardProgress.find(
    b => b.boardType === this.currentBoard && !b.completed
  );

  if (!currentBoard) return;

  // Only add to direct referrals if not already there
  if (!currentBoard.directReferrals.includes(newUserId)) {
    currentBoard.directReferrals.push(newUserId);
  }

  // Check if board is completed
  const requirements = this.getBoardRequirements(currentBoard.boardType);
  let isCompleted = false;

  if (['bronze', 'platinum'].includes(this.currentBoard)) {
    isCompleted = currentBoard.directReferrals.length >= requirements.direct;
  } else {
    // For silver/gold, calculate indirect referrals
    const indirectCount = await this.calculateIndirectReferrals();
    isCompleted = currentBoard.directReferrals.length >= requirements.direct && 
                 indirectCount >= requirements.indirect;
  }

  if (isCompleted) {
    currentBoard.completed = true;
    currentBoard.completionDate = new Date();
    await this.processBoardCompletion();
  }

  await this.save();

  // Update upline's indirect referrals if needed
  if (this.upline && ['silver', 'gold'].includes(this.currentBoard)) {
    const uplineUser = await this.model('User').findById(this.upline);
    if (uplineUser) {
      await uplineUser.updateIndirectReferral(newUserId);
    }
  }
};

userSchema.methods.getBoardRequirements = function(boardType) {
  switch(boardType) {
    case 'bronze':
    case 'platinum':
      return { direct: 7, indirect: 0 };
    case 'silver':
    case 'gold':
      return { direct: 7, indirect: 49 }; // 7x7 structure
    default:
      return { direct: 0, indirect: 0 };
  }
};

// Process new referral (called when a new user signs up)
userSchema.methods.processReferral = async function(referrerId) {
  if (!referrerId) return;
  
  // Prevent self-referral
  if (this._id.equals(referrerId)) {
    throw new Error("Cannot refer yourself");
  }

  this.referredBy = referrerId;
  this.upline = referrerId;

  const referrer = await this.model('User').findById(referrerId);
  if (!referrer) return;

  // Add to referrer's downlines
  if (!referrer.downlines.includes(this._id)) {
    referrer.downlines.push(this._id);
  }

  // Update the referrer's current board progress
  await referrer.updateBoardRecruitment(this._id);

  await referrer.save();
  await this.save();
};

// Update board recruitment counts
userSchema.methods.updateBoardRecruitment = async function(newDownlineId) {
  const currentBoardProgress = this.boardProgress.find(
    b => b.boardType === this.currentBoard && !b.completed
  );

  if (!currentBoardProgress) return;

  // Add to direct referrals if not already there
  if (!currentBoardProgress.directReferrals.includes(newDownlineId)) {
    currentBoardProgress.directReferrals.push(newDownlineId);
  }

  // Check if board is completed
  const requirements = this.getBoardRequirements(currentBoardProgress.boardType);
  let isCompleted = false;

  if (['bronze', 'platinum'].includes(this.currentBoard)) {
    isCompleted = currentBoardProgress.directReferrals.length >= requirements.direct;
  } else {
    // For silver/gold, we need to calculate indirect referrals
    const indirectCount = await this.calculateIndirectReferrals();
    isCompleted = currentBoardProgress.directReferrals.length >= requirements.direct && 
                 indirectCount >= requirements.indirect;
  }

  if (isCompleted) {
    currentBoardProgress.completed = true;
    currentBoardProgress.completionDate = new Date();
    await this.processBoardCompletion();
  }

  await this.save();

  // Update upline's indirect referrals if needed
  if (this.upline && ['silver', 'gold'].includes(this.currentBoard)) {
    const uplineUser = await this.model('User').findById(this.upline);
    if (uplineUser) {
      await uplineUser.updateIndirectReferral(newDownlineId);
    }
  }
};

userSchema.methods.calculateIndirectReferrals = async function() {
  let indirectCount = 0;
  
  const directDownlines = await this.model('User').find({ 
    referredBy: this._id,
    currentPlan: { $exists: true, $ne: null }
  }).select('_id').lean();

  for (const downline of directDownlines) {
    const downlineDownlines = await this.model('User').countDocuments({ 
      referredBy: downline._id,
      currentPlan: { $exists: true, $ne: null }
    });
    indirectCount += downlineDownlines;
  }
  
  return indirectCount;
};

userSchema.methods.updateIndirectReferral = async function(newDownlineId) {
  const currentBoardProgress = this.boardProgress.find(
    b => b.boardType === this.currentBoard && !b.completed
  );

  if (!currentBoardProgress) return;

  // Add to indirect referrals if not already there
  if (!currentBoardProgress.indirectReferrals.includes(newDownlineId)) {
    currentBoardProgress.indirectReferrals.push(newDownlineId);
  }

  // Check if board is completed
  if (this.checkBoardRequirements(currentBoardProgress)) {
    currentBoardProgress.completed = true;
    currentBoardProgress.completionDate = new Date();
    await this.processBoardCompletion();
  }

  await this.save();
};

// Check if board requirements are met
userSchema.methods.checkBoardRequirements = function(boardProgress) {
  const requirements = this.getBoardRequirements(boardProgress.boardType);
  
  if (['bronze', 'platinum'].includes(boardProgress.boardType)) {
    return boardProgress.directReferrals.length >= requirements.direct;
  } else {
    return (
      boardProgress.directReferrals.length >= requirements.direct && 
      boardProgress.indirectReferrals.length >= requirements.indirect
    );
  }
};


// Process board completion and move to next board
userSchema.methods.processBoardCompletion = async function() {
  const currentPlan = PLANS[this.currentPlan];
  if (!currentPlan) throw new Error('Invalid current plan');

  const completedBoard = this.boardProgress.find(
    b => b.boardType === this.currentBoard && b.completed && !b.rewardsClaimed
  );

  if (!completedBoard) return;

  const boardConfig = currentPlan.boards.find(b => 
    b.name.toLowerCase().includes(completedBoard.boardType)
  );

  if (!boardConfig) {
    throw new Error('Board configuration not found');
  }

  // Process rewards
  boardConfig.earnings.forEach(earning => {
    const amount = this.extractAmount(earning) || 0;

    if (earning.includes('Food Wallet') || earning.includes('FOODY BAG')) {
      this.wallets.food += amount;
    } 
    else if (earning.includes('Gadgets Wallet')) {
      this.wallets.gadget += amount;
    }
    else if (earning.includes('Cash Wallet')) {
      this.wallets.cash += amount;
    }
  });

  // Mark reward as claimed
  completedBoard.rewardsClaimed = true;

  // Promote to next board if applicable
  const nextBoard = this.getNextBoard();
  if (nextBoard) {
    this.currentBoard = nextBoard;
    this.boardProgress.push({
      boardType: nextBoard,
      directReferrals: [],
      indirectReferrals: [],
      completed: false,
      rewardsClaimed: false,
      startDate: new Date()
    });
  }

  await this.save();
};

// ============== HELPER METHODS ============== //

userSchema.methods.extractAmount = function(text) {
  const match = text.match(/₦([\d,]+)/);
  return match ? parseInt(match[1].replace(/,/g, '')) : 0;
};

userSchema.methods.getNextBoard = function() {
  const boards = ['bronze', 'silver', 'gold', 'platinum'];
  const currentIndex = boards.indexOf(this.currentBoard);
  return currentIndex < boards.length - 1 ? boards[currentIndex + 1] : null;
};

// ============== PRE HOOKS ============== //

userSchema.pre('save', async function(next) {
  if (!this.referralCode) {
    this.referralCode = await generateUniqueReferralCode(this.username);
  }
  next();
});

const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;