const Vault = require("../models/Vault");

exports.createVault = async (req, res) => {
  const vault = await Vault.create({
    ...req.body,
    createdBy: req.user.id
  });

  res.json(vault);
};

exports.getVaults = async (req, res) => {
  const vaults = await Vault.find();
  res.json(vaults);
};

exports.deleteVault = async (req, res) => {
  await Vault.findByIdAndDelete(req.params.id);
  res.json({ message: "Vault deleted" });
};