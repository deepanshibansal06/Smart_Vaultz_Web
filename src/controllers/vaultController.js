const Vault = require("../models/Vault");

exports.createVault = async (req, res) => {
  try {
    const { lockerNo, location, price, slotDate, timeSlot } = req.body;
    const vault = await Vault.create({
      lockerNo: (lockerNo != null && String(lockerNo).trim()) ? String(lockerNo).trim() : "",
      location: location != null ? String(location).trim() : "",
      price: price ?? 0,
      slotDate: slotDate != null ? String(slotDate) : "",
      timeSlot: timeSlot != null ? String(timeSlot) : "",
    });
    res.status(201).json(vault);
  } catch (err) {
    res.status(400).json({ message: err.message || "Failed to create vault" });
  }
};

exports.getVaults = async (req, res) => {
  const availableOnly = req.query.available === "true";
  const filter = availableOnly ? { status: "available" } : {};
  const vaults = await Vault.find(filter);
  res.json(vaults);
};

exports.updateVault = async (req, res) => {
  try {
    const { lockerNo, location, price, slotDate, timeSlot, status } = req.body;
    const update = {};
    if (lockerNo != null) update.lockerNo = String(lockerNo).trim();
    if (location != null) update.location = String(location).trim();
    if (price != null) update.price = Number(price);
    if (slotDate != null) update.slotDate = String(slotDate);
    if (timeSlot != null) update.timeSlot = String(timeSlot);
    if (status != null && ["available", "booked"].includes(status)) update.status = status;
    const vault = await Vault.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!vault) return res.status(404).json({ message: "Vault not found" });
    res.json(vault.toObject ? vault.toObject() : vault);
  } catch (err) {
    res.status(400).json({ message: err.message || "Failed to update vault" });
  }
};

exports.deleteVault = async (req, res) => {
  const vault = await Vault.findByIdAndDelete(req.params.id);
  if (!vault) return res.status(404).json({ message: "Vault not found" });
  res.json({ message: "Vault deleted" });
};