"use client"

import { useState, useEffect } from "react"
import { tasksAPI } from "../api/tasks"
import { FaTrash, FaComments, FaClock, FaSpinner, FaCheck } from "react-icons/fa"

function StatusButton({ status }) {
  const labelMap = {
    open: "Open",
    "in-progress": "In Progress",
    done: "Done",
  }

  const Icon = status === "open" ? FaClock : status === "in-progress" ? FaSpinner : FaCheck

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm cursor-pointer hover:border-blue-400 transition-all">
      <Icon className={`text-sm ${status === "in-progress" ? "animate-spin" : ""}`} />
      <span className="capitalize">{labelMap[status]}</span>
    </div>
  )
}

function TaskList({ filters, onTasksLoaded }) {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [openComments, setOpenComments] = useState({})
  const [commentsByTask, setCommentsByTask] = useState({})
  const [commentsLoading, setCommentsLoading] = useState({})
  const [commentInput, setCommentInput] = useState({})
  const [postingComment, setPostingComment] = useState({})
  const [statusOpen, setStatusOpen] = useState({})
  const user = JSON.parse(localStorage.getItem("user"))

  useEffect(() => {
    fetchTasks()
  }, [filters])

  const fetchTasks = async () => {
    setLoading(true)
    try {
      const taskFilters = {
        ...filters,
        assignedTo:
          !filters.assignedTo && user && user.role !== "admin"
            ? user.id
            : filters.assignedTo,
      }

      const response = await tasksAPI.getTasks(taskFilters)
      setTasks(response.data.tasks)
      onTasksLoaded(response.data.tasks)
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch tasks")
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await tasksAPI.updateTask(taskId, { status: newStatus })
      fetchTasks()
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update task")
    }
  }

  const handleDelete = async (taskId) => {
    if (!confirm("Are you sure you want to delete this task?")) return
    try {
      await tasksAPI.deleteTask(taskId)
      fetchTasks()
    } catch (err) {
      setError(err.response?.data?.error || "Failed to delete task")
    }
  }

  const toggleComments = async (taskId) => {
    setOpenComments((s) => ({ ...s, [taskId]: !s[taskId] }))
    if (!openComments[taskId] && !commentsByTask[taskId]) {
      setCommentsLoading((s) => ({ ...s, [taskId]: true }))
      try {
        const res = await tasksAPI.getComments(taskId)
        setCommentsByTask((s) => ({ ...s, [taskId]: res.data.comments }))
      } catch (err) {
        setError(err.response?.data?.error || "Failed to load comments")
      } finally {
        setCommentsLoading((s) => ({ ...s, [taskId]: false }))
      }
    }
  }

  const handleAddComment = async (taskId) => {
    const text = (commentInput[taskId] || "").trim()
    if (!text) return
    setPostingComment((s) => ({ ...s, [taskId]: true }))
    try {
      const res = await tasksAPI.addComment(taskId, { text })
      setCommentsByTask((s) => ({
        ...s,
        [taskId]: [...(s[taskId] || []), res.data.comment],
      }))
      setCommentInput((s) => ({ ...s, [taskId]: "" }))
    } catch (err) {
      setError(err.response?.data?.error || "Failed to post comment")
    } finally {
      setPostingComment((s) => ({ ...s, [taskId]: false }))
    }
  }

  if (loading) return <div className="text-white">Loading tasks...</div>
  if (error) return <div className="text-red-400">{error}</div>

  return (
    <div className="space-y-4 ">
      {tasks.map((task) => (
        <div
          key={task._id}
          className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/70 rounded-2xl p-5 shadow-lg hover:shadow-blue-500/20 transition-all duration-300"
        >
          {/* Task Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-white font-semibold text-lg tracking-wide">
                {task.title}
              </h3>
              {task.description && (
                <p className="text-slate-400 text-sm mt-1 leading-relaxed">
                  {task.description}
                </p>
              )}

              {/* Badges */}
              <div className="flex flex-wrap gap-3 mt-3">
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-medium shadow-md ${
                    task.priority === "high"
                      ? "bg-gradient-to-r from-red-700 to-red-500 text-red-100"
                      : task.priority === "medium"
                      ? "bg-gradient-to-r from-yellow-600 to-yellow-500 text-yellow-100"
                      : "bg-gradient-to-r from-blue-700 to-blue-500 text-blue-100"
                  }`}
                >
                  {task.priority.toUpperCase()}
                </span>

                {task.dueDate && (
                  <span className="text-xs px-2.5 py-1 rounded-full bg-slate-700 text-slate-300 border border-slate-600">
                    Due: {new Date(task.dueDate).toLocaleDateString()}
                  </span>
                )}

                {user.role === "admin" && task.assignedTo && (
                  <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-700/40 text-emerald-200 border border-emerald-500/40">
                    👤 {task.assignedTo.name}
                  </span>
                )}
              </div>
            </div>

            {/* Task Controls */}
            <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
              {/* Hover-to-open status dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setStatusOpen((s) => ({ ...s, [task._id]: true }))}
                onMouseLeave={() => setStatusOpen((s) => ({ ...s, [task._id]: false }))}
              >
                <StatusButton status={task.status} />

                {statusOpen[task._id] && (
                  <div className="absolute right-0 mt-2 w-44 bg-slate-700 border border-slate-600 rounded-lg shadow-lg z-20">
                    <button
                      onClick={() => handleStatusChange(task._id, "open")}
                      className="w-full text-left px-3 py-2 hover:bg-slate-600 flex items-center gap-2"
                    >
                      <FaClock className="text-sm text-blue-300" />
                      <span>Open</span>
                    </button>
                    <button
                      onClick={() => handleStatusChange(task._id, "in-progress")}
                      className="w-full text-left px-3 py-2 hover:bg-slate-600 flex items-center gap-2"
                    >
                      <FaSpinner className="text-sm text-yellow-300" />
                      <span>In Progress</span>
                    </button>
                    <button
                      onClick={() => handleStatusChange(task._id, "done")}
                      className="w-full text-left px-3 py-2 hover:bg-slate-600 flex items-center gap-2"
                    >
                      <FaCheck className="text-sm text-green-300" />
                      <span>Done</span>
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={() => toggleComments(task._id)}
                className="flex items-center gap-1 px-3 py-2 bg-slate-600 hover:bg-slate-500 text-white text-sm rounded-lg transition-all"
              >
                <FaComments />
                {openComments[task._id] ? "Hide" : "Comments"}
              </button>

              <button
                onClick={() => handleDelete(task._id)}
                className="flex items-center gap-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-all"
              >
                <FaTrash />
                Delete
              </button>
            </div>
          </div>

          {/* Comments Section */}
          {openComments[task._id] && (
            <div className="mt-4 border-t border-slate-700 pt-4 animate-fadeIn">
              {commentsLoading[task._id] ? (
                <div className="text-slate-400">Loading comments...</div>
              ) : (
                <div className="space-y-3">
                  {(commentsByTask[task._id] || []).map((c) => (
                    <div
                      key={c._id}
                      className="bg-slate-700/60 border border-slate-600 rounded-lg p-3 flex gap-3"
                    >
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center text-white font-bold">
                        {c.userId?.name?.[0]?.toUpperCase() || "U"}
                      </div>
                      <div>
                        <div className="text-slate-200 text-sm font-semibold">
                          {c.userId?.name || c.userId?.email || "Unknown"}
                        </div>
                        <div className="text-slate-300 text-sm">{c.text}</div>
                        <div className="text-slate-500 text-xs mt-1">
                          {new Date(c.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Add Comment Input */}
                  <div className="flex gap-2 mt-2">
                    <input
                      value={commentInput[task._id] || ""}
                      onChange={(e) =>
                        setCommentInput((s) => ({
                          ...s,
                          [task._id]: e.target.value,
                        }))
                      }
                      placeholder="Write a comment..."
                      className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all"
                    />
                    <button
                      onClick={() => handleAddComment(task._id)}
                      disabled={postingComment[task._id]}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm disabled:opacity-50 transition-all"
                    >
                      {postingComment[task._id] ? "Posting..." : "Add"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ))}

      {tasks.length === 0 && (
        <div className="text-slate-400 text-center py-10 italic">
          No tasks found ✨
        </div>
      )}
      <div className="h-12"></div>
    </div>
  )
}

export default TaskList
