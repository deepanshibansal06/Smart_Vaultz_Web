const User = require("../models/User");

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
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

    const user = await User.findByIdAndUpdate(req.user.id, update, { new: true }).select("-password");
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
