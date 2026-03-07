const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  vault: { type: mongoose.Schema.Types.ObjectId, ref: "Vault" },
  start: Date,
  end: Date,
  status: { type: String, default: "booked" },
  lockStatus: { type: String, default: "closed" },
  reminderSentAt: { type: Date, default: null }, // set when "10 min left" email is sent
});

module.exports = mongoose.model("Booking", bookingSchema);