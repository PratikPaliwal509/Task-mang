"use client"

import { useState, useEffect } from "react"
import { tasksAPI } from "../api/tasks"

function TaskList({ filters, onTasksLoaded }) {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [openComments, setOpenComments] = useState({})
  const [commentsByTask, setCommentsByTask] = useState({})
  const [commentsLoading, setCommentsLoading] = useState({})
  const [commentInput, setCommentInput] = useState({})
  const [postingComment, setPostingComment] = useState({})
  const user = JSON.parse(localStorage.getItem("user"))

  useEffect(() => {
    fetchTasks()
  }, [filters])

  const fetchTasks = async () => {
    setLoading(true)
    try {
      // Prepare filters object combining all filter criteria
      const taskFilters = {
        ...filters,
        // If user is not admin and no assignee is selected, show only their tasks
        assignedTo: (!filters.assignedTo && user && user.role !== "admin") 
          ? user.id 
          : filters.assignedTo
      }
      
      console.log('Sending filters to API:', taskFilters)

      // Send all filters to getTasks endpoint
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
    if (!confirm("Are you sure?")) return
    try {
      await tasksAPI.deleteTask(taskId)
      fetchTasks()
    } catch (err) {
      setError(err.response?.data?.error || "Failed to delete task")
    }
  }

  const toggleComments = async (taskId) => {
    setOpenComments((s) => ({ ...s, [taskId]: !s[taskId] }))

    // If opening and comments not loaded yet, fetch
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
      // append the new comment locally
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
    <div className="space-y-3">
      {tasks.map((task) => (
        <div key={task._id} className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-white font-semibold">{task.title}</h3>
              {task.description && <p className="text-slate-400 text-sm mt-1">{task.description}</p>}
              <div className="flex gap-3 mt-3 flex-wrap">
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    task.priority === "high"
                      ? "bg-red-900 text-red-200"
                      : task.priority === "medium"
                        ? "bg-yellow-900 text-yellow-200"
                        : "bg-blue-900 text-blue-200"
                  }`}
                >
                  {task.priority}
                </span>
                {task.dueDate && (
                  <span className="text-xs px-2 py-1 rounded bg-slate-700 text-slate-300">
                    {new Date(task.dueDate).toLocaleDateString()}
                  </span>
                )}
                {user.role === "admin" && task.assignedTo && (
                  <span className="text-xs px-2 py-1 rounded bg-gray-700 text-gray-300">
                    Assigned to: {task.assignedTo.name}
                  </span>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <select
                value={task.status}
                onChange={(e) => handleStatusChange(task._id, e.target.value)}
                className="px-3 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:outline-none"
              >
                <option value="open">Open</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>

              <button
                onClick={() => handleDelete(task._id)}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded"
              >
                Delete
              </button>

              {/* Comments button */}
              <button
                onClick={() => toggleComments(task._id)}
                className="px-3 py-1 bg-slate-600 hover:bg-slate-500 text-white text-sm rounded"
              >
                {openComments[task._id] ? "Hide" : "Comments"}
              </button>
            </div>
          </div>

          {/* Comments section */}
          {openComments[task._id] && (
            <div className="mt-4 border-t border-slate-700 pt-4">
              {commentsLoading[task._id] ? (
                <div className="text-slate-400">Loading comments...</div>
              ) : (
                <div className="space-y-3">
                  {(commentsByTask[task._id] || []).map((c) => (
                    <div key={c._id} className="bg-slate-700 p-3 rounded">
                      <div className="text-slate-200 text-sm font-semibold">{c.userId?.name || c.userId?.email || 'Unknown'}</div>
                      <div className="text-slate-300 text-sm">{c.text}</div>
                      <div className="text-slate-500 text-xs mt-1">{new Date(c.createdAt).toLocaleString()}</div>
                    </div>
                  ))}

                  <div className="flex gap-2">
                    <input
                      value={commentInput[task._id] || ""}
                      onChange={(e) => setCommentInput((s) => ({ ...s, [task._id]: e.target.value }))}
                      placeholder="Write a comment..."
                      className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none"
                    />
                    <button
                      onClick={() => handleAddComment(task._id)}
                      disabled={postingComment[task._id]}
                      className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-50"
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

      {tasks.length === 0 && <div className="text-slate-400 text-center py-8">No tasks found</div>}
    </div>
  )
}

export default TaskList
