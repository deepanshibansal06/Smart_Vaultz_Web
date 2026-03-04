const Booking = require("../models/Booking");
const Vault = require("../models/Vault");
const User = require("../models/User");

exports.dashboard = async (req, res) => {
  const totalUsers = await User.countDocuments();
  const totalVaults = await Vault.countDocuments();
  const totalBookings = await Booking.countDocuments();

  res.json({
    totalUsers,
    totalVaults,
    totalBookings
  });
};