"use client"

import { useState, useEffect } from "react"
import { tasksAPI } from "../api/tasks"

function TaskBoard({ filters, onTasksLoaded }) {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTasks()
  }, [filters])

  const fetchTasks = async () => {
    setLoading(true)
    try {
      const response = await tasksAPI.getTasks(filters)
      setTasks(response.data.tasks)
      onTasksLoaded(response.data.tasks)
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
    open: { title: "Open", tasks: tasks.filter((t) => t.status === "open") },
    "in-progress": { title: "In Progress", tasks: tasks.filter((t) => t.status === "in-progress") },
    done: { title: "Completed", tasks: tasks.filter((t) => t.status === "done") },
  }

  if (loading) return <div className="text-white">Loading board...</div>

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {Object.entries(columns).map(([key, column]) => (
        <div key={key} className="bg-slate-800 border border-slate-700 rounded-lg p-4 min-h-96">
          <h3 className="text-white font-semibold mb-4">{column.title}</h3>
          <div className="space-y-3">
            {column.tasks.map((task) => (
              <div
                key={task._id}
                className="bg-slate-700 border border-slate-600 rounded-lg p-3 hover:border-blue-400 transition-colors cursor-move"
                draggable
                onDragEnd={(e) => {
                  const targetStatus = Object.keys(columns).find((k) => {
                    const element = document.elementFromPoint(e.clientX, e.clientY)
                    return element?.closest(`[data-status="${k}"]`)
                  })
                  if (targetStatus && targetStatus !== key) {
                    handleStatusChange(task._id, targetStatus)
                  }
                }}
              >
                <h4 className="text-white font-semibold text-sm">{task.title}</h4>
                <span
                  className={`inline-block text-xs px-2 py-1 rounded mt-2 ${
                    task.priority === "high"
                      ? "bg-red-900 text-red-200"
                      : task.priority === "medium"
                        ? "bg-yellow-900 text-yellow-200"
                        : "bg-blue-900 text-blue-200"
                  }`}
                >
                  {task.priority}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default TaskBoard
