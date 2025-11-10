import express from "express"
import { authenticateToken, authorizeAdmin } from "../middleware/auth.js"
import User from "../models/User.js"

const router = express.Router()

// Get all users (admin only)
router.get("/", authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const users = await User.find().select("-password")
    res.json({ users })
  } catch (error) {
    console.error("Get users error:", error)
    res.status(500).json({ error: "Failed to fetch users" })
  }
})

// Get current user
router.get("/me", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password")
    res.json({ user })
  } catch (error) {
    console.error("Get current user error:", error)
    res.status(500).json({ error: "Failed to fetch user" })
  }
})

export default router
