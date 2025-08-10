import mongoose from 'mongoose';
import { PLANS } from "../lib/plans";

// Helper function to generate unique referral code
async function generateUniqueReferralCode(username) {
  let randomSuffix = Math.floor(1000 + Math.random() * 9000);
  let referralCode = `${username.slice(0, 3)}${randomSuffix}`.toUpperCase();
  
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
    enum: ['bronze', 'silver', 'gold', 'platinum', 'exit']
  },
  completed: {
    type: Boolean,
    default: false
  },
  completionDate: Date,
  directReferrals: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    countedFor: [{
      type: String,
      enum: ['bronze', 'silver', 'gold', 'platinum', 'exit']
    }]
  }],
  indirectReferrals: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    countedForBoard: String,
    level: Number, // 1 = direct's direct (Silver), 2 = Gold, ..., 7 = Exit
    generation: Number // 1-7 (for matrix visualization)
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

const matrixProgressSchema = new mongoose.Schema({
  level: { type: Number, default: 1 },
  completedLevels: [{
    level: Number,
    completionDate: Date,
    referralsRequired: Number,
    referralsAchieved: Number
  }],
  isFullyCompleted: { type: Boolean, default: false }
}, { _id: false });

const matrixAuditSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  level: Number,
  action: {
    type: String,
    enum: ['referral-added', 'board-completed', 'level-achieved']
  },
  details: mongoose.Schema.Types.Mixed
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
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user"
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
  verifyToken: {
    type: String,
  },
  expireToken: {
   type: String,
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
    enum: ['bronze', 'silver', 'gold', 'platinum', 'exit'],
    default: 'bronze'
  },
  boardProgress: {
    type: [boardProgressSchema],
    default: [{
      boardType: 'bronze',
      completed: false,
      directReferrals: [],
      indirectReferrals: [],
      rewardsClaimed: false,
      startDate: new Date()
    }]
  },
  matrixProgress: {
    type: matrixProgressSchema,
    default: () => ({
      level: 1,
      completedLevels: [],
      isFullyCompleted: false
    })
  },
  matrixAuditTrail: {
    type: [matrixAuditSchema],
    default: []
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

  // Special rewards
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

// ============== INDEXES ============== //
userSchema.index({ referredBy: 1 });
userSchema.index({ 'boardProgress.boardType': 1, 'boardProgress.completed': 1 });
userSchema.index({ 'matrixProgress.level': 1 });
userSchema.index({ 'matrixProgress.isFullyCompleted': 1 });

// ============== METHODS ============== //

userSchema.methods.activatePlan = async function(planType, paymentProof) {
  if (!['basic', 'classic', 'deluxe'].includes(planType)) {
    throw new Error('Invalid plan type');
  }

  this.currentPlan = planType;
  
  this.planHistory.push({
    planType,
    startDate: new Date(),
    paymentProof,
    status: 'active'
  });

  // Initialize board progress if empty
  if (this.boardProgress.length === 0) {
    this.boardProgress = [{
      boardType: 'bronze',
      completed: false,
      directReferrals: [],
      indirectReferrals: [],
      rewardsClaimed: false,
      startDate: new Date()
    }];
  }

  await this.save();

  if (this.referredBy) {
    const referrer = await this.model('User').findById(this.referredBy);
    if (referrer) {
      await referrer.processActivatedReferral(this._id, planType);
    }
  }

  return this;
};

userSchema.methods.getBoardRequirements = function(boardType) {
  const requirements = {
    bronze: { direct: 7, matrixLevels: [] },
    silver: { direct: 7, matrixLevels: [2] },
    gold: { direct: 7, matrixLevels: [3] },
    platinum: { direct: 7, matrixLevels: [4] },
    exit: { direct: 7, matrixLevels: [5,6,7] }
  };
  return requirements[boardType] || { direct: 0, matrixLevels: [] };
};

userSchema.methods.updateIndirectReferral = async function(newUserId, level) {
  const boardTypes = ['bronze', 'silver', 'gold', 'platinum', 'exit'];
  const currentBoardIndex = boardTypes.indexOf(this.currentBoard);
  
  // Only count if the referral's level matches the board's required depth
  // (e.g., Silver = level 2, Gold = level 3, etc.)
  if (level > currentBoardIndex + 1) return;

  const currentBoard = this.boardProgress.find(
    b => b.boardType === this.currentBoard && !b.completed
  );

  if (!currentBoard) return;

  // Avoid duplicates
  const exists = currentBoard.indirectReferrals.some(
    ref => ref.userId.equals(newUserId) && ref.level === level
  );

  if (!exists) {
    currentBoard.indirectReferrals.push({
      userId: newUserId,
      countedForBoard: this.currentBoard,
      level,
      generation: level // For matrix visualization
    });

    await this.save();
  }
};

userSchema.methods.getNextBoard = function() {
  const boards = ['bronze', 'silver', 'gold', 'platinum', 'exit'];
  const currentIndex = boards.indexOf(this.currentBoard);
  
  // Return next board or null if at the end
  return currentIndex < boards.length - 1 ? boards[currentIndex + 1] : null;
};

userSchema.methods.processBoardCompletion = async function() {

  console.log("herehhhhh")
  if (!this.getNextBoard) {
    throw new Error('getNextBoard method is not defined');
  }

  const completedBoard = this.boardProgress.find(
    b => b.boardType === this.currentBoard && b.completed && !b.rewardsClaimed
  );

  if (!completedBoard) return;

  const currentPlan = PLANS[this.currentPlan];
  if (!currentPlan) {
    throw new Error('Invalid current plan');
  }

  const boardConfig = currentPlan.boards.find(b => 
    b.name.toLowerCase().includes(completedBoard.boardType)
  );

  if (!boardConfig) {
    throw new Error('Board configuration not found');
  }

  // Process rewards
  boardConfig.earnings.forEach(earning => {
    const amount = this.extractAmount(earning) || 0;
    if (earning.includes('Food Wallet')) {
      this.wallets.food += amount;
    } else if (earning.includes('Gadgets Wallet')) {
      this.wallets.gadget += amount;
    } else if (earning.includes('Cash Wallet')) {
      this.wallets.cash += amount;
    }
  });

  completedBoard.rewardsClaimed = true;

  // Promote to next board if applicable
  const nextBoard = this.getNextBoard();
  if (nextBoard) {
    this.currentBoard = nextBoard;
    
    // Only carry forward referrals that haven't been counted for this board yet
    const newDirectRefs = completedBoard.directReferrals.map(ref => ({
      userId: ref.userId,
      countedFor: [] // Start fresh for new board
    }));

    this.boardProgress.push({
      boardType: nextBoard,
      directReferrals: newDirectRefs,
      indirectReferrals: [],
      completed: false,
      rewardsClaimed: false,
      startDate: new Date()
    });
  }

  await this.save();
};

userSchema.methods.extractAmount = function(text) {
  if (!text) return 0;
  
  // Handle ₦ format (e.g., "₦5,000")
  const nairaMatch = text.match(/₦([\d,]+)/);
  if (nairaMatch) {
    return parseInt(nairaMatch[1].replace(/,/g, '')) || 0;
  }
  
  // Handle plain numbers (e.g., "5000" or "1,000")
  const numberMatch = text.match(/([\d,]+)/);
  if (numberMatch) {
    return parseInt(numberMatch[1].replace(/,/g, '')) || 0;
  }
  
  return 0;
};

// Add this method to your userSchema.methods
userSchema.methods.processActivatedReferral = async function(newUserId, planType) {
  // Find current active board (not completed)
  const currentBoard = this.boardProgress.find(
    b => b.boardType === this.currentBoard && !b.completed
  );

  if (!currentBoard) return;

  // Check if this referral already exists in any board
  let existingRef = null;
  for (const board of this.boardProgress) {
    const ref = board.directReferrals.find(r => r.userId.equals(newUserId));
    if (ref) {
      existingRef = ref;
      break;
    }
  }

  if (existingRef) {
    // Only add to countedFor if this is the current board and not already counted
    if (!existingRef.countedFor.includes(this.currentBoard)) {
      existingRef.countedFor.push(this.currentBoard);
    }
  } else {
    // Add as new direct referral only for current board
    currentBoard.directReferrals.push({
      userId: newUserId,
      countedFor: [this.currentBoard]
    });
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

userSchema.methods.addAuditEvent = function(action, details) {
  this.matrixAuditTrail.push({
    action,
    details,
    timestamp: new Date(),
    board: this.currentBoard
  });
};

userSchema.methods.calculateIndirectReferrals = async function(maxLevel = 7) {
  let total = 0;
  
  // Get all direct downlines (Level 1)
  const directDownlines = await this.model('User').find({ 
    referredBy: this._id 
  }).select('_id').lean();

  // Recursively count downlines up to maxLevel
  const countDownlines = async (userId, currentLevel) => {
    if (currentLevel > maxLevel) return 0;
    
    const downlines = await this.model('User').find({ 
      referredBy: userId 
    }).select('_id').lean();

    let subtotal = downlines.length;
    for (const dl of downlines) {
      subtotal += await countDownlines(dl._id, currentLevel + 1);
    }
    return subtotal;
  };

  for (const dl of directDownlines) {
    total += await countDownlines(dl._id, 2); // Start counting from Level 2
  }

  return total;
};

userSchema.methods.checkExitBoardEligibility = async function() {
  const indirectCount = await this.calculateIndirectReferrals(7); // 7 levels deep
  return indirectCount >= 960799; // 7⁷ - 1
};

// ============== HOOKS ============== //
userSchema.pre('save', async function(next) {
  if (!this.referralCode) {
    this.referralCode = await generateUniqueReferralCode(this.username);
  }
  next();
});

userSchema.pre('save', async function(next) {
  if (this.isModified('referredBy') && !this.isNew) {
    try {
      const original = await this.constructor.findById(this._id, 'referredBy');
      if (original?.referredBy && this.referredBy && 
          !original.referredBy.equals(this.referredBy)) {
        throw new Error('Referral relationship cannot be changed once set');
      }
    } catch (err) {
      return next(err);
    }
  }
  next();
});

userSchema.pre('save', function(next) {
  if (this.isModified('currentBoard') && !this.isNew) {
    const boardOrder = ['bronze', 'silver', 'gold', 'platinum', 'exit'];
    const currentIdx = boardOrder.indexOf(this._original?.currentBoard || 'bronze');
    const newIdx = boardOrder.indexOf(this.currentBoard);
    
    if (newIdx !== currentIdx + 1) {
      return next(new Error('Can only progress to next immediate board level'));
    }
  }
  next();
});

const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;