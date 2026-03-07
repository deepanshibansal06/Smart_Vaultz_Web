const bcrypt = require("bcrypt");

async function generateHash() {
  const password = "adminlogin";
  const saltRounds = 10;

  try {
    const hash = await bcrypt.hash(password, saltRounds);
    console.log("Hashed Password:", hash);
  } catch (error) {
    console.error("Error generating hash:", error);
  }
}

generateHash();