const Booking = require("../models/Booking");
const Vault = require("../models/Vault");
const User = require("../models/User");

exports.dashboard = async (req, res) => {
  const totalUsers = await User.countDocuments();
  const totalVaults = await Vault.countDocuments();
  // Only count vaults currently booked (admin may have set some to available)
  const totalBookings = await Vault.countDocuments({ status: "booked" });

  res.json({
    totalUsers,
    totalVaults,
    totalBookings
  });
};