const Booking = require("../models/Booking");
const Vault = require("../models/Vault");
const axios = require("axios");

exports.bookVault = async (req, res) => {
  const { vaultId, start, end } = req.body;

  const vault = await Vault.findById(vaultId);

  const conflict = await Booking.findOne({
    vault: vaultId,
    start: { $lt: end },
    end: { $gt: start }
  });

  if (conflict)
    return res.status(400).json({ msg: "Time slot already booked" });

  const booking = await Booking.create({
    user: req.user.id,
    vault: vaultId,
    start,
    end
  });

  res.json(booking);
};

exports.openVault = async (req, res) => {
  const booking = await Booking.findById(req.params.id);

  const now = new Date();

  if (now < booking.start || now > booking.end)
    return res.status(400).json({ msg: "Booking not active" });

  await axios.get(`http://${process.env.ESP_IP}/open`);

  booking.lockStatus = "open";
  await booking.save();

  res.json({ msg: "Vault opened" });
};

exports.closeVault = async (req, res) => {
  const booking = await Booking.findById(req.params.id);

  await axios.get(`http://${process.env.ESP_IP}/close`);

  booking.lockStatus = "closed";
  await booking.save();

  res.json({ msg: "Vault closed" });
};