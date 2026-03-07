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

app.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
  // Every minute: send "10 min left" reminder and "booking over" emails, then remove ended bookings
  setInterval(runBookingEmailJob, 60 * 1000);
  runBookingEmailJob(); // run once on startup (catches any missed in downtime)
});