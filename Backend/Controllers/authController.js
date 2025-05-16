import User from "../Models/userModel.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";

import {
  sendPasswordResetEmail,
  sendResetSuccessEmail,
  sendVerificationEmail,
  sendWelcomeEmail,
} from "../mailTrap/emails.js";
import { sendOtp } from "../twilio/smsConfig.js";

export const signup = async (req, res) => {
  const { identifier, password, name } = req.body;
  // res.send('signup route');
  try {
    if (!identifier || !password || !name) {
      throw new Error("Email or phone, password, and name are required.");
    }

    // const query = {};
    // if (identifier) query.identifier = identifier;

    const isEmail = /^[\w.-]+@[\w-]+\.[\w-]{2,4}$/.test(identifier);
    const isPhone = /^\+?[1-9]\d{1,14}$/.test(identifier);

    if (!isEmail && !isPhone) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email or phone format." });
    }
    
    const query = isEmail ? { email: identifier } : isPhone ? { phone: identifier } : {};
    const userAlreadyExists = await User.findOne(query);

    // const userAlreadyExists = await User.findOne({
    //   $or: [{ email }, { phone }],
    // });
    console.log("userAlreadyExists: ", userAlreadyExists);

    if (userAlreadyExists) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    // const verificationCode = generateVerificationCode();
    const verificationToken = Math.floor(
      100000 + Math.random() * 900000
    ).toString();
    const user = new User({
      email: identifier.includes("@") ? identifier : null,
      phone: identifier.includes("@") ? null : identifier,
      // identifier: identifier, || null,
      password: hashedPassword,
      name,
      verificationToken,
      verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    });

    await user.save();

    // jwt
    generateTokenAndSetCookie(res, user._id);

    if (isEmail) {
      await sendVerificationEmail(identifier, verificationToken);
    } else {
      await sendOtp(identifier, verificationToken);
    }

    res.status(201).json({
      success: true,
      message: "User created successsfully",
      user: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const verifyPhone = async (req, res) => {
  const { phone, code } = req.body;

  try {
    const user = await User.findOne({
      phone,
      phoneVerificationCode: code,
      phoneVerificationExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invailed or expired OTP.",
      });
    }

    user.isPhoneVerified = true;
    user.phoneVerificationCode = undefined;
    user.phoneVerificationExpiresAt = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Phone number verified successfully.",
      user: {
        ...User._doc,
        password: undefined,
      },
    });
  } catch (e) {
    console.error("Error verification phone: ", e);
    res.ststus(500).json({
      success: false,
      message: "An error occurred while verifying the phone number.",
    });
  }
};

export const verifyEmail = async (req, res) => {
  const { code } = req.body;
  try {
    const user = await User.findOne({
      verificationToken: code,
      verificationTokenExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification code",
      });
    }

    user.isVerfied = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;
    await user.save();

    await sendWelcomeEmail(user.email, user.name);

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
      user: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (e) {
    console.error("Error in email verification or welcome email:", e);

    // Send an error response back to the client
    res.status(500).json({
      success: false,
      message:
        "An error occurred while sending the welcome email or verifying the user.",
    });
  }
};

export const login = async (req, res) => {
  // res.send("login route");
  const { identifier, password } = req.body;
  try {
    const user = await User.findOne({
      $or: [{ email: identifier }, { phone: identifier }],
    });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }

    generateTokenAndSetCookie(res, user._id);

    user.lastLogin = new Date();
    await user.save();

    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      user: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (error) {
    console.log("Error in login : ", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const forgotPassword = async (req, res) => {
  // const { email } = req.body;
  const { identifier } = req.body;
  try {
    // const user = await User.findOne({ email });

    const user = await User.findOne({
      $or: [{ email: identifier }, { phone: identifier }],
    });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000; // 1 hour

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiresAt = resetTokenExpiresAt;

    await user.save();

    // Send email
    await sendPasswordResetEmail(
      user.email,
      `${process.env.CLIENT_URL}/reset-password/${resetToken}`
    );

    res.status(200).json({
      success: true,
      message: "Password reset link sent to your email",
    });
  } catch (error) {
    console.log("Error in forgotPassword ", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: " invalid or expired reset token" });
    }

    // Update password
    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresAt = undefined;
    await user.save();

    await sendResetSuccessEmail(user.email);

    res
      .status(200)
      .json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    console.log("Error in resetPassword ", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const logout = async (req, res) => {
  // res.send("logout route");
  res.clearCookie("token");
  res.status(200).json({ success: true, message: "Logged out" });
};

export const checkAuth = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    // console.log("User from DB:", user);
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.log("Error in CheckAuth ", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password -verificationToken");
    res.status(200).json({
      success: true,
      // message: "User fetched successfully",
      message: users.length
        ? `${users.length} user(s) fetched successfully`
        : "No users found",
      totalUser: users.length,
      users,
    });
  } catch (e) {
    console.error("Error in getAllUsers", e.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
};
