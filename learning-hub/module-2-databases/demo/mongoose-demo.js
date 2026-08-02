import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load the environment variables from the main backend .env file
dotenv.config({ path: path.join(__dirname, "../../../backend/.env") });

const mongoUri = process.env.MONGO_URI;

if (!mongoUri) {
  console.error("\x1b[31m%s\x1b[0m", "❌ MONGO_URI not found in backend/.env!");
  console.log("Please check that d:/WebDev/Projects/call.io/backend/.env contains a MONGO_URI string.");
  process.exit(1);
}

async function runDemo() {
  console.log("\x1b[36m%s\x1b[0m", "🔄 Connecting to MongoDB...");
  await mongoose.connect(mongoUri);
  console.log("\x1b[32m%s\x1b[0m", "✅ Connected successfully!");

  // 1. Define the Mongoose Schema
  const demoUserSchema = new mongoose.Schema({
    username: {
      type: String,
      required: [true, "Username is required"],
      minlength: [3, "Username must be at least 3 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // Prevents password from returning in queries
    },
  });

  // 2. Pre-save Hook to automatically hash passwords
  demoUserSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    
    console.log("\x1b[33m%s\x1b[0m", "\n[Pre-Save Hook] Password modification detected. Starting Bcrypt hashing..."); // \x1b[33m%s\x1b[0m is for coloring the text in terminal
    console.log(`[Pre-Save Hook] Plain password: "${this.password}"`);
    
    // Hash password with 10 salt rounds
    this.password = await bcrypt.hash(this.password, 10);
    
    console.log(`[Pre-Save Hook] Hashed password: "${this.password}"`);
    next();
  });

  // 3. Schema method to compare passwords
  demoUserSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
  };

  // Compile the Schema into a Model (uses unique collection 'learning_users')
  const DemoUser = mongoose.model("LearningUser", demoUserSchema, "learning_users");

  // Clean up previous runs
  await DemoUser.deleteMany({});

  try {
    console.log("\x1b[36m%s\x1b[0m", "\n==============================================");
    console.log("🔥 EXPERIMENT 1: Creating & Saving a Valid User");
    console.log("==============================================");

    const email = `test-${Math.floor(Math.random() * 100000)}@learning.com`;
    const newUser = new DemoUser({
      username: "CoderNewbie",
      email: email,
      password: "securePassword123",
    });

    console.log(`Saving user: ${newUser.username} (${newUser.email})`);
    const savedUser = await newUser.save();

    console.log("\x1b[32m%s\x1b[0m", "\n💾 User successfully saved to MongoDB!");
    console.log("Here is the JavaScript object returned by Mongoose (Note the missing password field):");
    console.log(savedUser.toObject());

    console.log("\x1b[36m%s\x1b[0m", "\n==============================================");
    console.log("🔥 EXPERIMENT 2: Testing select: false Exclusion");
    console.log("==============================================");
    
    // Attempt standard search query
    let userFromDb = await DemoUser.findOne({ email });
    console.log("Finding user without custom select parameter:");
    console.log(`Found: `, userFromDb.toObject());
    console.log(`Is password field defined? ${userFromDb.password ? "Yes" : "No (Exclusion worked!)"}`);

    // Bypassing exclusion explicitly
    console.log("\nFinding user with explicit select('+password'):");
    userFromDb = await DemoUser.findOne({ email }).select("+password");
    console.log(`Found: `, userFromDb.toObject());
    console.log(`Is password field defined? ${userFromDb.password ? "Yes (Retrieved!)" : "No"}`);

    console.log("\x1b[36m%s\x1b[0m", "\n==============================================");
    console.log("🔥 EXPERIMENT 3: Comparing Passwords with Bcrypt");
    console.log("==============================================");
    
    const wrongAttempt = "wrongPassword";
    const correctAttempt = "securePassword123";

    console.log(`Testing incorrect password: "${wrongAttempt}"`);
    const isMatch1 = await userFromDb.comparePassword(wrongAttempt);
    console.log(`Result: ${isMatch1 ? "MATCHED (Failed safety)" : "REJECTED (Correct security)"}`);

    console.log(`\nTesting correct password: "${correctAttempt}"`);
    const isMatch2 = await userFromDb.comparePassword(correctAttempt);
    console.log(`Result: ${isMatch2 ? "MATCHED (Success!)" : "REJECTED"}`);

    console.log("\x1b[36m%s\x1b[0m", "\n==============================================");
    console.log("🔥 EXPERIMENT 4: Schema-Level Validation Error");
    console.log("==============================================");

    console.log("Attempting to save user with invalid password (length < 6) and invalid username (length < 3)...");
    const invalidUser = new DemoUser({
      username: "Jo",
      email: "badEmail",
      password: "123",
    });

    try {
      await invalidUser.save();
    } catch (validationError) {
      console.log("\x1b[31m%s\x1b[0m", "\n❌ Mongoose validation intercepted saved document!");
      console.log("Validation error details:");
      Object.keys(validationError.errors).forEach((field) => {
        console.log(`  - Field [${field}]: ${validationError.errors[field].message}`);
      });
    }

  } catch (error) {
    console.error("Unexpected error in demo:", error);
  } finally {
    // Drop the demo collection to keep your database clean
    console.log("\x1b[33m%s\x1b[0m", "\n🧹 Cleaning up demo collections from MongoDB...");
    await DemoUser.collection.drop();
    console.log("Closing connection...");
    await mongoose.connection.close();
    console.log("\x1b[32m%s\x1b[0m", "👋 Goodbye!");
  }
}

runDemo().catch(console.error);
