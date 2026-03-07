const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, default: "user" }, // user or superadmin
  phone: { type: String, default: "" },
  address: { type: String, default: "" },
  location: { type: String, default: "" },
  walletBalance: { type: Number, default: 0 },
  mpinSet: { type: Boolean, default: false },
});

module.exports = mongoose.model("User", userSchema);