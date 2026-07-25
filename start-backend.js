const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

async function start() {
  console.log("Starting embedded local MongoDB engine...");
  const mongod = await MongoMemoryServer.create({
    instance: {
      dbName: "smart_vault",
      args: ["--nounixsocket"],
    },
  });

  const uri = mongod.getUri("smart_vault");
  process.env.MONGO_URI = uri;
  console.log(`Local MongoDB running at: ${uri}`);

  await mongoose.connect(uri);
  console.log("Mongoose connected successfully to local MongoDB memory server!");

  // Require main express app server
  require("./src/server.js");

  // Seed default admin and sample lockers immediately
  try {
    const User = require("./src/models/User");
    const Vault = require("./src/models/Vault");

    const adminEmail = "admin@smartvault.online";
    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      const hash = await bcrypt.hash("adminlogin", 10);
      await User.create({
        name: "Super Admin",
        email: adminEmail,
        password: hash,
        role: "superadmin",
        walletBalance: 10000,
        mpinSet: true,
        mpinHash: await bcrypt.hash("1234", 10),
      });
      console.log(`[SEED] Created default Superadmin account (${adminEmail} / adminlogin)`);
    }

    const count = await Vault.countDocuments();
    if (count === 0) {
      await Vault.create([
        {
          lockerNo: "1",
          name: "Smart Cyber Locker #1 (ESP Attached)",
          location: "Main Terminal - Gate A",
          price: 150,
          slotDate: "2026-08-01",
          timeSlot: "9:00 AM - 6:00 PM",
          status: "available",
        },
        {
          lockerNo: "2",
          name: "Executive Vault Locker #2",
          location: "North Wing - Level 2",
          price: 200,
          slotDate: "2026-08-01",
          timeSlot: "9:00 AM - 6:00 PM",
          status: "available",
        },
        {
          lockerNo: "3",
          name: "Compact Secure Storage #3",
          location: "East Plaza - Ground Level",
          price: 100,
          slotDate: "2026-08-01",
          timeSlot: "9:00 AM - 6:00 PM",
          status: "available",
        },
      ]);
      console.log("[SEED] Seeded 3 default Smart Vault lockers into local DB");
    }
  } catch (err) {
    console.error("Seed error:", err);
  }
}

start().catch(console.error);
