const Booking = require("../models/Booking");
const Vault = require("../models/Vault");
const axios = require("axios");

exports.bookVault = async (req, res) => {
  try {
    const { vaultId, start, end } = req.body;
    const vault = await Vault.findById(vaultId);
    if (!vault) return res.status(404).json({ message: "Vault not found" });
    if (vault.status === "booked") return res.status(400).json({ message: "Vault is already booked" });

    const startDate = start ? new Date(start) : new Date();
    const endDate = end ? new Date(end) : new Date(Date.now() + 24 * 60 * 60 * 1000);
    const conflict = await Booking.findOne({
      vault: vaultId,
      start: { $lt: endDate },
      end: { $gt: startDate },
    });
    if (conflict) return res.status(400).json({ message: "Time slot already booked" });

    const booking = await Booking.create({
      user: req.user.id,
      vault: vaultId,
      start: startDate,
      end: endDate,
    });
    await Vault.findByIdAndUpdate(vaultId, { status: "booked" });
    const populated = await Booking.findById(booking._id).populate("vault");
    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ message: err.message || "Booking failed" });
  }
};

exports.myBookings = async (req, res) => {
  const bookings = await Booking.find({ user: req.user.id })
    .populate("vault")
    .sort({ createdAt: -1 });
  res.json(bookings);
};

exports.openVault = async (req, res) => {
  const booking = await Booking.findById(req.params.id).populate("vault");
  if (!booking) return res.status(404).json({ message: "Booking not found" });
  if (booking.user.toString() !== req.user.id) return res.status(403).json({ message: "Not your booking" });
  const now = new Date();
  if (now < booking.start || now > booking.end) return res.status(400).json({ message: "Booking not active" });
  try {
    if (process.env.ESP_IP) await axios.get(`http://${process.env.ESP_IP}/open`, { timeout: 5000 });
  } catch (_) {}
  booking.lockStatus = "open";
  await booking.save();
  res.json({ message: "Vault opened" });
};

exports.closeVault = async (req, res) => {
  const booking = await Booking.findById(req.params.id).populate("vault");
  if (!booking) return res.status(404).json({ message: "Booking not found" });
  if (booking.user.toString() !== req.user.id) return res.status(403).json({ message: "Not your booking" });
  try {
    if (process.env.ESP_IP) await axios.get(`http://${process.env.ESP_IP}/close`, { timeout: 5000 });
  } catch (_) {}
  booking.lockStatus = "closed";
  await booking.save();
  res.json({ message: "Vault closed" });
};