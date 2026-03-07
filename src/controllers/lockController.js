const Booking = require("../models/Booking");
const Vault = require("../models/Vault");

/**
 * GET /api/lock/status?vaultId=xxx  or  ?lockerNo=1
 * Public endpoint for ESP8266 to poll. Returns plain text "open" or "close".
 * Locker 1 (lockerNo "1") is the one with ESP hardware; use vaultId or lockerNo=1.
 */
exports.getLockStatus = async (req, res) => {
  let vaultId = req.query.vaultId || process.env.DEFAULT_VAULT_ID;
  const lockerNo = req.query.lockerNo;
  if (!vaultId && (lockerNo === "1" || lockerNo === 1)) {
    const vault = await Vault.findOne({ lockerNo: "1" }).lean();
    vaultId = vault ? vault._id.toString() : null;
  }
  if (!vaultId) {
    return res.status(200).send("close");
  }
  try {
    const vault = await Vault.findById(vaultId);
    if (!vault) return res.status(200).send("close");
    const booking = await Booking.findOne({ vault: vaultId })
      .sort({ createdAt: -1 })
      .lean();
    if (!booking) return res.status(200).send("close");
    const state = booking.lockStatus === "open" ? "open" : "close";
    res.status(200).type("text/plain").send(state);
  } catch (err) {
    res.status(200).send("close");
  }
};
