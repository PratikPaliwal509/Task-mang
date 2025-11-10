import express from "express"
import { authenticateToken } from "../middleware/auth.js"
import Task from "../models/Task.js"

import { sendEmail } from "../utils/sendEmail.js";
const router = express.Router()

// Get all tasks with filters
router.get("/", authenticateToken, async(req, res) => {
    try {
        const { status, priority, assignedTo, search, startDate, endDate } = req.query

        const filter = {}

        if (status) filter.status = status
        if (priority) filter.priority = priority
        if (assignedTo) filter.assignedTo = assignedTo

        if (search) {
            filter.$or = [{ title: { $regex: search, $options: "i" } }, { description: { $regex: search, $options: "i" } }]
        }

        if (startDate || endDate) {
            filter.dueDate = {}
            if (startDate) {
                filter.dueDate.$gte = new Date(startDate)
            }
            if (endDate) {
                filter.dueDate.$lte = new Date(endDate)
            }
        }

        const tasks = await Task.find(filter)
            .populate("assignedTo", "id email name")
            .populate("createdBy", "id email name")
            .sort({ createdAt: -1 })

        res.json({ tasks })
    } catch (error) {
        console.error("Get tasks error:", error)
        res.status(500).json({ error: "Failed to fetch tasks" })
    }
})

// Get tasks by assignee
router.get("/assigned/:userId", authenticateToken, async(req, res) => {
    try {
        const tasks = await Task.find({ assignedTo: req.params.userId })
            .populate("assignedTo", "id email name")
            .populate("createdBy", "id email name")
            .sort({ createdAt: -1 })

        res.json({ tasks })
    } catch (error) {
        console.error("Get tasks by assignee error:", error)
        res.status(500).json({ error: "Failed to fetch tasks" })
    }
})

// Create task
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { title, description, priority, dueDate, assignedTo } = req.body;

    if (!title) {
      return res.status(400).json({ error: "Task title is required" });
    }

    // Only admins can assign tasks to others
    if (assignedTo && assignedTo !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Only admins can assign tasks to other users" });
    }

    const task = new Task({
      title,
      description,
      priority: priority || "medium",
      dueDate,
      assignedTo: assignedTo || req.user.id,
      createdBy: req.user.id,
    });

    await task.save();
    await task.populate("assignedTo", "id email name");
    await task.populate("createdBy", "id email name");

    // ✅ Send Email Notification
    const assignedUser = task.assignedTo;
    if (assignedUser?.email) {
      const subject = `📝 New Task Assigned: ${task.title}`;
      const message = `
        Hello ${assignedUser.name || "User"},
        
        A new task has been assigned to you.
        
        Title: ${task.title}
        Priority: ${task.priority}
        Due Date: ${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No due date"}
        
        Description:
        ${task.description || "No description provided."}

        — Task Manager
      `;

      const htmlMessage = `
        <h2>New Task Assigned</h2>
        <p><b>Title:</b> ${task.title}</p>
        <p><b>Priority:</b> ${task.priority}</p>
        <p><b>Due Date:</b> ${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No due date"}</p>
        <p><b>Description:</b> ${task.description || "No description provided."}</p>
        <br/>
        <p>Assigned by: <b>${task.createdBy.name || task.createdBy.email}</b></p>
        <p style="color:#888">– Task Manager System</p>
      `;

      await sendEmail(assignedUser.email, subject, message, htmlMessage);
    }

    res.status(201).json({ task });
  } catch (error) {
    console.error("Create task error:", error);
    res.status(500).json({ error: "Failed to create task" });
  }
});

// router.post("/", authenticateToken, async(req, res) => {
//     try {
//         const { title, description, priority, dueDate, assignedTo } = req.body

//         if (!title) {
//             return res.status(400).json({ error: "Task title is required" })
//         }

//         // Only admins can assign tasks to others
//         if (assignedTo && assignedTo !== req.user.id && req.user.role !== "admin") {
//             return res.status(403).json({ error: "Only admins can assign tasks to other users" })
//         }

//         const task = new Task({
//             title,
//             description,
//             priority: priority || "medium",
//             dueDate,
//             assignedTo: assignedTo || req.user.id,
//             createdBy: req.user.id,
//         })

//         await task.save()
//         await task.populate("assignedTo", "id email name")
//         await task.populate("createdBy", "id email name")

//         res.status(201).json({ task })
//     } catch (error) {
//         console.error("Create task error:", error)
//         res.status(500).json({ error: "Failed to create task" })
//     }
// })

// Add comment to a task
router.post("/:id/comments", authenticateToken, async (req, res) => {
    try {
        const { text } = req.body

        if (!text || !text.trim()) {
            return res.status(400).json({ error: "Comment text is required" })
        }

        const task = await Task.findById(req.params.id)
        if (!task) {
            return res.status(404).json({ error: "Task not found" })
        }

        const comment = {
            userId: req.user.id,
            text: text.trim(),
        }

        task.comments.push(comment)
        await task.save()

        // Populate comment user info and return the newly added comment
        await task.populate("comments.userId", "id email name")
        await task.populate("assignedTo", "id email name")
        await task.populate("createdBy", "id email name")

        const added = task.comments[task.comments.length - 1]
        res.status(201).json({ comment: added })
    } catch (error) {
        console.error("Add comment error:", error)
        res.status(500).json({ error: "Failed to add comment" })
    }
})

// View comments for a task
router.get("/:id/comments", authenticateToken, async (req, res) => {
    try {
        const task = await Task.findById(req.params.id)
            .populate("comments.userId", "id email name")
            .populate("assignedTo", "id email name")
            .populate("createdBy", "id email name")

        if (!task) {
            return res.status(404).json({ error: "Task not found" })
        }

        res.json({ comments: task.comments })
    } catch (error) {
        console.error("Get comments error:", error)
        res.status(500).json({ error: "Failed to fetch comments" })
    }
})

// Update task
router.patch("/:id", authenticateToken, async(req, res) => {
    try {
        const { title, description, status, priority, dueDate, assignedTo } = req.body

        const task = await Task.findById(req.params.id)
        if (!task) {
            return res.status(404).json({ error: "Task not found" })
        }

        // Only admin or assignee can update task status
        if (
            task.assignedTo.toString() !== req.user.id &&
            task.createdBy.toString() !== req.user.id &&
            req.user.role !== "admin"
        ) {
            return res.status(403).json({ error: "Not authorized to update this task" })
        }

        // Only admins can reassign tasks
        if (assignedTo && assignedTo !== task.assignedTo.toString() && req.user.role !== "admin") {
            return res.status(403).json({ error: "Only admins can reassign tasks" })
        }

        if (title) task.title = title
        if (description !== undefined) task.description = description
        if (status) task.status = status
        if (priority) task.priority = priority
        if (dueDate) task.dueDate = dueDate
        if (assignedTo) task.assignedTo = assignedTo

        await task.save()
        await task.populate("assignedTo", "id email name")
        await task.populate("createdBy", "id email name")

        res.json({ task })
    } catch (error) {
        console.error("Update task error:", error)
        res.status(500).json({ error: "Failed to update task" })
    }
})

// Delete task
router.delete("/:id", authenticateToken, async(req, res) => {
    try {
        const task = await Task.findById(req.params.id)
        if (!task) {
            return res.status(404).json({ error: "Task not found" })
        }

        // Only admin or creator can delete
        if (task.createdBy.toString() !== req.user.id && req.user.role !== "admin") {
            return res.status(403).json({ error: "Not authorized to delete this task" })
        }

        await Task.findByIdAndDelete(req.params.id)
        res.json({ message: "Task deleted successfully" })
    } catch (error) {
        console.error("Delete task error:", error)
        res.status(500).json({ error: "Failed to delete task" })
    }
})

export default router