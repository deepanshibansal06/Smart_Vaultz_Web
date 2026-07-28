require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

connectDB();

const app = express();

app.use(
  cors({
    origin: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept", "Origin", "X-Requested-With"],
    credentials: true,
    optionsSuccessStatus: 204,
  })
);
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    status: "online",
    message: "Smart Vaultz Cyber Security Backend API is running successfully!",
    endpoints: {
      auth: "/api/auth",
      vaults: "/api/vaults",
      users: "/api/users",
      bookings: "/api/bookings",
      admin: "/api/admin",
    },
  });
});

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/vaults", require("./routes/vaultRoutes"));
app.use("/api/bookings", require("./routes/bookingRoutes"));
app.use("/api/lock", require("./routes/lockRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));

// Always return JSON on errors (avoids FormatException in app when response is HTML)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: err.message || "Something went wrong" });
});

const PORT = Number(process.env.PORT) || 5000;
const HOST = process.env.HOST || "0.0.0.0";

const { runBookingEmailJob } = require("./jobs/bookingEmailJob");

async function seedDatabase() {
  try {
    const User = require("./models/User");
    const Vault = require("./models/Vault");
    const bcrypt = require("bcryptjs");

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

app.listen(PORT, HOST, async () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
  await seedDatabase();
  setInterval(runBookingEmailJob, 20 * 1000);
  runBookingEmailJob();
});