const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
  key: { type: String, unique: true },
  codes: [String],
  expiresAt: { type: Date, expires: 600 }
});

const OtpModel = mongoose.models.Otp || mongoose.model("Otp", otpSchema);
const OTPS_MEM = new Map();

function key(email, type) {
  return `${String(email).trim().toLowerCase()}:${type}`;
}

exports.set = async (email, type, code) => {
  const k = key(email, type);
  const codeStr = String(code).trim();
  const existingMem = OTPS_MEM.get(k);
  const updatedCodes = existingMem ? [...existingMem.codes, codeStr] : [codeStr];
  OTPS_MEM.set(k, { codes: updatedCodes, expiresAt: Date.now() + 600000 });

  try {
    await OtpModel.findOneAndUpdate(
      { key: k },
      { $addToSet: { codes: codeStr }, expiresAt: new Date(Date.now() + 600000) },
      { upsert: true }
    );
  } catch (err) {
    console.warn("MongoDB OTP store error:", err.message);
  }
};

exports.verify = async (email, type, inputCode) => {
  const k = key(email, type);
  const target = String(inputCode).trim();
  if (!target) return false;

  const mem = OTPS_MEM.get(k);
  if (mem && Date.now() <= mem.expiresAt) {
    if (mem.codes.includes(target)) return true;
  }

  try {
    const doc = await OtpModel.findOne({ key: k });
    if (doc && doc.expiresAt > new Date() && Array.isArray(doc.codes)) {
      if (doc.codes.includes(target)) return true;
    }
  } catch (err) {
    console.warn("MongoDB OTP verify error:", err.message);
  }
  return false;
};

exports.get = async (email, type) => {
  const k = key(email, type);
  const mem = OTPS_MEM.get(k);
  if (mem && Date.now() <= mem.expiresAt && mem.codes.length > 0) {
    return mem.codes[mem.codes.length - 1];
  }
  try {
    const doc = await OtpModel.findOne({ key: k });
    if (doc && doc.expiresAt > new Date() && Array.isArray(doc.codes) && doc.codes.length > 0) {
      return doc.codes[doc.codes.length - 1];
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
