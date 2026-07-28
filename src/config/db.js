const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

const connectDB = async () => {
  try {
    if (mongoose.connection.readyState >= 1) {
      console.log("MongoDB Connected (Existing)");
      return;
    }

    let uri = process.env.MONGO_URI;
    if (!uri) {
      console.log("MONGO_URI not set. Initializing embedded MongoMemoryServer...");
      const mongod = await MongoMemoryServer.create({
        instance: {
          dbName: "smart_vault",
          args: ["--nounixsocket"],
        },
      });
      uri = mongod.getUri("smart_vault");
      process.env.MONGO_URI = uri;
      console.log(`Embedded MongoMemoryServer running at: ${uri}`);
    }

    await mongoose.connect(uri);
    console.log("MongoDB Connected successfully!");
  } catch (error) {
    console.error("MongoDB Connection Error:", error);
    process.exit(1);
  }
};

module.exports = connectDB;