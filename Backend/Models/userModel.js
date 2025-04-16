import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    // unique: true,
    sparse: true,
  },
  phone: {
    type: String,
    // unique: true,
    sparse: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  lastLogin: {
    type: Date,
    default: Date.now,
  },
  isVerfied: {
    type: Boolean,
    default: false,
  },
  isPhoneVerified: {
    type: Boolean,
    default: false,
  },
  resetPasswordToken: String,
  resetPasswordExpiresAt: Date,
  verificationToken: String,
  verificationTokenExpiresAt: Date,
  phoneVerificationCode: String,
  phoneVerificationExpiresAt: Date,
},{timestamps: true});

const User = mongoose.model('User', userSchema);

export default User;