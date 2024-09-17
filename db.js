const mongoose = require("mongoose");
require("dotenv").config();

// MongoDB connection URI
const MONGO_URI = process.env.MONGO_URI;

// Define a schema for storing user data
const userSchema = new mongoose.Schema({
  userId: { type: Number, required: true, unique: true },
  firstName: String,
  lastName: String,
  username: String,
  dateJoined: { type: Date, default: Date.now },
  balance: { type: Number, default: 0 }, // Add balance field
});

// Define a schema for storing investments
const investmentSchema = new mongoose.Schema({
  userId: { type: Number, required: true },
  firstName: String,
  amount: { type: Number, required: true },
  processed: { type: Boolean, default: false },
  dateInvested: { type: Date, default: Date.now },
});

// Define a schema for storing withdrawals
const withdrawalSchema = new mongoose.Schema({
  userId: { type: Number, required: true },
  withdrawnAmount: { type: Number, required: true },
  updatedBalance: { type: Number, required: true },
  wallet: { type: String || Number, required: true, unique: true },
  dateWithdrawn: { type: Date, default: Date.now },
});

// Create models based on the schemas
const User = mongoose.model("User", userSchema);
const Investment = mongoose.model("Investment", investmentSchema);
const Withdrawal = mongoose.model("Withdrawal", withdrawalSchema);

async function connectToDatabase() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected successfully");
  } catch (err) {
    console.error("MongoDB connection error:", err);
  }
}

module.exports = {
  connectToDatabase,
  User,
  Investment,
  Withdrawal,
};
