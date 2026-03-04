const mongoose = require("mongoose");

const vaultSchema = new mongoose.Schema({
  name: String,
  location: String,
  price: Number,
  timeSlots: [
    {
      start: Date,
      end: Date,
      isBooked: { type: Boolean, default: false }
    }
  ]
});

module.exports = mongoose.model("Vault", vaultSchema);