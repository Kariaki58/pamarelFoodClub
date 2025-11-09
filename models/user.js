import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  verifyToken: {
    type: String
  },
  expireToken: {
    type: Date
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'suspended'],
    default: 'pending'
  },
  phone: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user"
  },
  referralCode: {
    type: String,
    unique: true,
    required: true,
  },
  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  currentBoard: {
    type: String,
    enum: ['Bronze', 'Silver', 'Gold', 'Completed'],
    default: 'Bronze'
  },
  boardProgress: {
    Bronze: {
      directReferrals: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }],
      completed: {
        type: Boolean,
        default: false
      },
      completionDate: Date
    },
    Silver: {
      level1Referrals: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }],
      level2Referrals: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }],
      completed: {
        type: Boolean,
        default: false
      },
      completionDate: Date
    },
    Gold: {
      level3Referrals: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }],
      level4Referrals: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }],
      completed: {
        type: Boolean,
        default: false
      },
      completionDate: Date
    },
  },
  earnings: {
    foodWallet: {
      type: Number,
      default: 0
    },
    gadgetsWallet: {
      type: Number,
      default: 0
    },
    cashWallet: {
      type: Number,
      default: 0
    }
  },
  plan: {
    type: String,
    enum: ['basic', 'classic', 'deluxe'],
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

userSchema.methods.generateReferralCode = function() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;