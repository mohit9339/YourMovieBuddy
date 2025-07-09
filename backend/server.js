const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/user");
const { getIMDBRating } = require("./imdbScraper");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000; // ✅ Render will set PORT dynamically

// ✅ Use your actual deployed frontend domain here
const CLIENT_URL = "https://your-vercel-site.vercel.app"; // replace this!

// ✅ Middleware
app.use(cors({
  origin: CLIENT_URL,
  credentials: true,
}));
app.use(express.json());

// ✅ Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ✅ Test route
app.get("/api/test", (req, res) => {
  res.json({ message: "Backend is alive!" });
});

// ✅ Signup Route
app.post("/api/signup", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: "Email and password required" });

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(409).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      email,
      password: hashedPassword,
      favorites: [],
      watched: [],
      recommended: [],
    });

    await newUser.save();
    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    console.error("❌ Signup error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Login Route
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: "Email and password required" });

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ message: "Invalid email or password" });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(401).json({ message: "Invalid email or password" });

    res.status(200).json({
      message: "Login successful",
      user: { email: user.email },
    });
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Get all movie lists for a user
app.get("/api/user/:email/lists", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      favorites: user.favorites || [],
      watched: user.watched || [],
      recommended: user.recommended || [],
    });
  } catch (err) {
    console.error("❌ Failed to fetch user lists:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Add or remove a movie from a list
app.post("/api/user/:email/lists", async (req, res) => {
  const { type, movieId, action } = req.body;
  const validTypes = ["favorites", "watched"];
  if (!validTypes.includes(type)) {
    return res.status(400).json({ message: "Invalid list type" });
  }

  try {
    const user = await User.findOne({ email: req.params.email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const movieIdNum = Number(movieId);

    if (action === "add") {
      if (!user[type].includes(movieIdNum)) user[type].push(movieIdNum);
      await user.save();
      return res.json({ message: `Movie added to ${type}` });
    } else if (action === "remove") {
      user[type] = user[type].filter((id) => id !== movieIdNum);
      await user.save();
      return res.json({ message: `Movie removed from ${type}` });
    } else {
      return res.status(400).json({ message: "Invalid action" });
    }

  } catch (err) {
    console.error("❌ List update error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ IMDb rating route
app.get("/api/imdb-rating/:imdbId", async (req, res) => {
  const { imdbId } = req.params;
  if (!imdbId) return res.status(400).json({ message: "IMDb ID is required" });

  try {
    const rating = await getIMDBRating(imdbId);
    res.json({ imdbId, rating });
  } catch (err) {
    console.error("❌ IMDb rating fetch error:", err);
    res.status(500).json({ message: "Failed to fetch IMDb rating" });
  }
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
