"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { tasksAPI } from "../api/tasks"
import { GripVertical } from "lucide-react"

export default function TaskBoard({ filters, onTasksLoaded }) {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [draggingTask, setDraggingTask] = useState(null)

  useEffect(() => {
    fetchTasks()
  }, [filters])

  const fetchTasks = async () => {
    setLoading(true)
    try {
      const res = await tasksAPI.getTasks(filters)
      setTasks(res.data.tasks)
      onTasksLoaded(res.data.tasks)
    } catch (err) {
      console.error("Failed to fetch tasks:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await tasksAPI.updateTask(taskId, { status: newStatus })
      fetchTasks()
    } catch (err) {
      console.error("Failed to update task:", err)
    }
  }

  const columns = {
    open: { title: "🟢 Open", color: "border-emerald-400", tasks: tasks.filter((t) => t.status === "open") },
    "in-progress": {
      title: "🟡 In Progress",
      color: "border-yellow-400",
      tasks: tasks.filter((t) => t.status === "in-progress"),
    },
    done: { title: "🔵 Completed", color: "border-blue-400", tasks: tasks.filter((t) => t.status === "done") },
  }

  if (loading) return <div className="text-white text-center mt-10">✨ Loading your board...</div>

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
      {Object.entries(columns).map(([key, col]) => (
        <div
          key={key}
          data-status={key}
          className={`bg-slate-800 border ${col.color} rounded-2xl shadow-lg p-4 min-h-[28rem] flex flex-col transition-all hover:shadow-emerald-500/20`}
        >
          <h3 className="text-white font-bold text-lg mb-4 flex items-center justify-between">
            {col.title}
            <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded-full">
              {col.tasks.length}
            </span>
          </h3>

          <div className="space-y-3 flex-1">
            {col.tasks.length === 0 && (
              <div className="text-slate-400 italic text-sm text-center py-4">
                No tasks yet
              </div>
            )}

            {col.tasks.map((task) => (
              <motion.div
                key={task._id}
                layout
                draggable
                onDragStart={() => setDraggingTask(task)}
                onDragEnd={(e) => {
                  const target = Object.keys(columns).find((k) =>
                    document.elementFromPoint(e.clientX, e.clientY)?.closest(`[data-status="${k}"]`)
                  )
                  if (target && target !== key) handleStatusChange(task._id, target)
                  setDraggingTask(null)
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`group bg-slate-700/80 border border-slate-600 hover:border-blue-400 transition-all rounded-xl p-3 cursor-grab active:cursor-grabbing backdrop-blur-sm`}
              >
                <div className="flex items-start gap-2">
                  <GripVertical size={16} className="text-slate-400 mt-1 group-hover:text-blue-400 transition" />
                  <div className="flex flex-col">
                    <h4 className="text-white font-semibold text-sm">{task.title}</h4>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{task.description || "No description"}</p>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-3">
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full ${
                      task.priority === "high"
                        ? "bg-red-900/60 text-red-200"
                        : task.priority === "medium"
                          ? "bg-yellow-900/60 text-yellow-200"
                          : "bg-blue-900/60 text-blue-200"
                    }`}
                  >
                    {task.priority}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(task.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
