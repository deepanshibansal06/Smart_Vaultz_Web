const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const otpStore = require("../utils/otpStore");
const sendMail = require("../utils/sendMail");

const OTP_LEN = 6;
function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

exports.sendOtp = async (req, res) => {
  try {
    const { email, type } = req.body;
    const emailNorm = email?.trim()?.toLowerCase();
    if (!emailNorm) {
      return res.status(400).json({ message: "Email is required" });
    }
    if (type !== "forgot" && type !== "signup") {
      return res.status(400).json({ message: "Invalid type. Use 'forgot' or 'signup'" });
    }
    if (type === "signup") {
      const existing = await User.findOne({ email: emailNorm });
      if (existing) {
        return res.status(400).json({ message: "An account with this email already exists" });
      }
    }
    if (type === "forgot") {
      const user = await User.findOne({ email: emailNorm });
      if (!user) {
        return res.status(400).json({ message: "No account found with this email" });
      }
    }
    const otp = generateOtp();
    otpStore.set(emailNorm, type, otp);
    await sendMail.sendOtpEmail(emailNorm, otp, type);
    res.json({
      message: "OTP sent to your email",
      checkSpamNotice: sendMail.getSpamNotice(),
    });
  } catch (err) {
    console.error("Send OTP error:", err);
    res.status(500).json({ message: "Failed to send OTP" });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const emailNorm = email?.trim()?.toLowerCase();
    if (!emailNorm || !otp || !newPassword) {
      return res.status(400).json({ message: "Email, OTP and new password are required" });
    }
    const stored = otpStore.get(emailNorm, "forgot");
    if (!stored || stored !== String(otp).trim()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }
    const user = await User.findOne({ email: emailNorm });
    if (!user) return res.status(400).json({ message: "User not found" });
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    otpStore.consume(emailNorm, "forgot");
    res.json({ message: "Password reset successfully" });
  } catch (err) {
    res.status(400).json({ message: err.message || "Reset failed" });
  }
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, otp } = req.body;
    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }
    const emailNorm = email.trim().toLowerCase();
    if (otp != null && String(otp).trim() !== "") {
      const stored = otpStore.get(emailNorm, "signup");
      if (!stored || stored !== String(otp).trim()) {
        return res.status(400).json({ message: "Invalid or expired OTP" });
      }
      otpStore.consume(emailNorm, "signup");
    }

    const hash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name.trim(),
      email: emailNorm,
      password: hash
    });

    const { password: _, ...safe } = user.toObject();
    res.status(201).json(safe);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "An account with this email already exists" });
    }
    if (err.name === "ValidationError") {
      return res.status(400).json({ message: err.message || "Validation failed" });
    }
    console.error("Register error:", err);
    res.status(500).json({ message: "Registration failed. Please try again." });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const emailNorm = email?.trim()?.toLowerCase();
  if (!emailNorm || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const user = await User.findOne({ email: emailNorm });
  if (!user) return res.status(400).json({ message: "User not found" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ message: "Wrong password" });

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET
  );

  res.json({
    token,
    role: user.role,
    name: user.name,
    email: user.email,
  });
};