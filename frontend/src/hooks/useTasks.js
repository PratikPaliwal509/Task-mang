"use client"

import { useState, useCallback } from "react"
import { tasksAPI } from "../api/tasks"

export function useTasks() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchTasks = useCallback(async (filters = {}) => {
    setLoading(true)
    setError(null)
    try {
      const response = await tasksAPI.getTasks(filters)
      setTasks(response.data.tasks)
      return response.data.tasks
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Failed to fetch tasks"
      setError(errorMsg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const createTask = useCallback(async (taskData) => {
    try {
      const response = await tasksAPI.createTask(taskData)
      setTasks((prev) => [response.data.task, ...prev])
      return response.data.task
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Failed to create task"
      setError(errorMsg)
      throw err
    }
  }, [])

  const updateTask = useCallback(async (id, taskData) => {
    try {
      const response = await tasksAPI.updateTask(id, taskData)
      setTasks((prev) => prev.map((t) => (t._id === id ? response.data.task : t)))
      return response.data.task
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Failed to update task"
      setError(errorMsg)
      throw err
    }
  }, [])

  const deleteTask = useCallback(async (id) => {
    try {
      await tasksAPI.deleteTask(id)
      setTasks((prev) => prev.filter((t) => t._id !== id))
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Failed to delete task"
      setError(errorMsg)
      throw err
    }
  }, [])

  return {
    tasks,
    loading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
  }
}
