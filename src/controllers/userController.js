const bcrypt = require("bcrypt");
const User = require("../models/User");

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password -mpinHash");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to get profile" });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, address, location } = req.body;
    const update = {};
    if (name !== undefined) update.name = String(name).trim();
    if (phone !== undefined) update.phone = String(phone).trim();
    if (address !== undefined) update.address = String(address).trim();
    if (location !== undefined) update.location = String(location).trim();

    const user = await User.findByIdAndUpdate(req.user.id, update, { new: true }).select("-password -mpinHash");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(400).json({ message: err.message || "Update failed" });
  }
};

exports.getWalletBalance = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("walletBalance");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ balance: user.walletBalance ?? 0 });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to get balance" });
  }
};

exports.setMpin = async (req, res) => {
  try {
    const pin = req.body.pin != null ? String(req.body.pin).trim() : "";
    if (!/^\d{4}$/.test(pin)) {
      return res.status(400).json({ message: "MPIN must be 4 digits" });
    }
    const hash = await bcrypt.hash(pin, 10);
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { mpinHash: hash, mpinSet: true },
      { new: true }
    ).select("-password -mpinHash");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "MPIN set", mpinSet: true });
  } catch (err) {
    res.status(400).json({ message: err.message || "Failed to set MPIN" });
  }
};

exports.verifyMpin = async (req, res) => {
  try {
    const pin = req.body.pin != null ? String(req.body.pin).trim() : "";
    if (!/^\d{4}$/.test(pin)) {
      return res.status(400).json({ valid: false, message: "Invalid MPIN" });
    }
    const user = await User.findById(req.user.id).select("mpinHash");
    if (!user || !user.mpinHash) {
      return res.status(400).json({ valid: false, message: "MPIN not set" });
    }
    const valid = await bcrypt.compare(pin, user.mpinHash);
    if (!valid) return res.status(200).json({ valid: false });
    res.status(200).json({ valid: true });
  } catch (err) {
    res.status(400).json({ valid: false, message: err.message || "Verification failed" });
  }
};

exports.addWalletMoney = async (req, res) => {
  try {
    const amount = Number(req.body.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $inc: { walletBalance: amount } },
      { new: true }
    ).select("walletBalance");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ balance: user.walletBalance });
  } catch (err) {
    res.status(400).json({ message: err.message || "Failed to add money" });
  }
};
