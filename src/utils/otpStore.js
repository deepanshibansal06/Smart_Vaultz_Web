const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
  key: { type: String, unique: true },
  code: String,
  expiresAt: { type: Date, expires: 600 }
});

const OtpModel = mongoose.models.Otp || mongoose.model("Otp", otpSchema);
const OTPS_MEM = new Map();

function key(email, type) {
  return `${email.toLowerCase()}:${type}`;
}

exports.set = async (email, type, code) => {
  const k = key(email, type);
  OTPS_MEM.set(k, { code: String(code), expiresAt: Date.now() + 600000 });
  try {
    await OtpModel.findOneAndUpdate(
      { key: k },
      { code: String(code), expiresAt: new Date(Date.now() + 600000) },
      { upsert: true }
    );
  } catch (err) {
    console.warn("MongoDB OTP store error:", err.message);
  }
};

exports.get = async (email, type) => {
  const k = key(email, type);
  const mem = OTPS_MEM.get(k);
  if (mem && Date.now() <= mem.expiresAt) {
    return mem.code;
  }
  try {
    const doc = await OtpModel.findOne({ key: k });
    if (doc && doc.expiresAt > new Date()) {
      return doc.code;
    }
  } catch (err) {
    console.warn("MongoDB OTP retrieve error:", err.message);
  }
  return null;
};

exports.consume = async (email, type) => {
  const k = key(email, type);
  OTPS_MEM.delete(k);
  try {
    await OtpModel.deleteOne({ key: k });
  } catch (err) {
    console.warn("MongoDB OTP consume error:", err.message);
  }
};
