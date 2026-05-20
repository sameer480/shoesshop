const User = require("../models/User");
const bcrypt = require("bcryptjs");
const { OAuth2Client } = require("google-auth-library");
const generateToken = require("../utils/generateToken");
const { sendOTPEmail } = require("../utils/sendEmail");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes

const registerUser = async (req, res) => {
  try {
    const { name, email, mobile, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await User.create({
      name,
      email,
      mobile,
      password: hashedPassword,
      authProvider: "local",
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User is not registered. Please sign up first.",
      });
    }

    if (!user.password) {
      return res.status(400).json({
        message:
          "This account was created with Google. Please sign in with Google, or use 'Forgot password' to set one.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        message: "Google credential is required",
      });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    const user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (!user) {
      return res.status(404).json({
        message: "User is not registered. Please sign up first.",
      });
    }

    if (!user.googleId) {
      user.googleId = googleId;
      user.authProvider = "google";
      if (picture && !user.avatar) user.avatar = picture;
      await user.save();
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const googleRegister = async (req, res) => {
  try {
    const { credential, mobile } = req.body;

    if (!credential) {
      return res.status(400).json({
        message: "Google credential is required",
      });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    const existingUser = await User.findOne({ $or: [{ googleId }, { email }] });
    if (existingUser) {
      return res.status(400).json({
        message: "User already exists. Please sign in instead.",
      });
    }

    const user = await User.create({
      name,
      email,
      mobile,
      googleId,
      avatar: picture,
      authProvider: "google",
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        message: "This email is not registered.",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = await bcrypt.hash(otp, 10);
    user.otpExpires = new Date(Date.now() + OTP_TTL_MS);
    await user.save();

    const hasMailCreds = process.env.EMAIL_USER && process.env.EMAIL_PASS;

    if (hasMailCreds) {
      try {
        await sendOTPEmail(email, otp);
        return res.json({
          message: "OTP sent to your registered email.",
        });
      } catch (mailErr) {
        console.error("OTP email send failed:", mailErr);
        // fall through to dev-mode console output
      }
    }

    // Dev mode: no email credentials (or sending failed) — print OTP to console
    console.log("\n=================================================");
    console.log("  PASSWORD RESET OTP (dev mode — no email sent)");
    console.log("  Email: " + email);
    console.log("  OTP:   " + otp);
    console.log("  Valid for 10 minutes");
    console.log("=================================================\n");

    res.json({
      message:
        "OTP generated. Check your server console for the code (email not configured).",
      devOtp: otp,
    });
  } catch (error) {
    console.error("forgotPassword error:", error);
    res.status(500).json({ message: error.message });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const user = await User.findOne({ email });
    if (!user || !user.otp || !user.otpExpires) {
      return res.status(400).json({ message: "OTP not requested" });
    }
    if (Date.now() > user.otpExpires.getTime()) {
      return res.status(400).json({ message: "OTP has expired. Please request a new one." });
    }

    const valid = await bcrypt.compare(otp, user.otp);
    if (!valid) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    res.json({ message: "OTP verified successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, otp, password } = req.body;
    if (!email || !otp || !password) {
      return res
        .status(400)
        .json({ message: "Email, OTP and new password are required" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    const user = await User.findOne({ email });
    if (!user || !user.otp || !user.otpExpires) {
      return res.status(400).json({ message: "OTP not requested" });
    }
    if (Date.now() > user.otpExpires.getTime()) {
      return res.status(400).json({ message: "OTP has expired. Please request a new one." });
    }

    const valid = await bcrypt.compare(otp, user.otp);
    if (!valid) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.json({ message: "Password has been reset successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  googleLogin,
  googleRegister,
  forgotPassword,
  verifyOtp,
  resetPassword,
};
