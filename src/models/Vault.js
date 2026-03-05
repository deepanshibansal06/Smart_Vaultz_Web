const mongoose = require("mongoose");

const vaultSchema = new mongoose.Schema({
  lockerNo: { type: String, default: "" },
  name: String,
  location: { type: String, default: "" },
  price: { type: Number, required: true },
  slotDate: { type: String, default: "" }, // e.g. "2025-03-10"
  timeSlot: { type: String, default: "" }, // e.g. "9:00 AM - 6:00 PM"
  status: { type: String, enum: ["available", "booked"], default: "available" },
  timeSlots: [
    {
      start: Date,
      end: Date,
      isBooked: { type: Boolean, default: false },
    },
  ],
});

module.exports = mongoose.model("Vault", vaultSchema);