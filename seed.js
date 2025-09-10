// seed.js
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { connectDB } from "./src/lib/db.js";
import { User } from "./src/model/user.js";
import 'dotenv/config';

async function seed() {
  try {
    await connectDB();

    const count = await User.countDocuments();
    if (count > 0) {
      console.log("Users already exist, skipping seeding");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash("123456", 10);

    const manager = await User.create({
      name: "Dharmik",
      email: "dharmik@gmail.com",
      password: hashedPassword,
      role: "manager",
    });

    console.log("Seeded first manager:", manager.email);
    process.exit(0);
  } catch (err) {
    console.error("Seeding error:", err);
    process.exit(1);
  }
}

seed();
