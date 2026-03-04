const mongoose = require("mongoose");

const vaultSchema = new mongoose.Schema({
  lockerNo: { type: String, default: "" }, // e.g. "L001" - for IoT locker mapping
  name: String,
  location: { type: String, default: "" },
  price: { type: Number, required: true },
  timeSlot: { type: String, default: "" }, // e.g. "9:00 AM - 6:00 PM"
  timeSlots: [
    {
      start: Date,
      end: Date,
      isBooked: { type: Boolean, default: false },
    },
  ],
});

module.exports = mongoose.model("Vault", vaultSchema);