"use client"

import { useState, useEffect } from "react"

function TaskFilters({ onFiltersChange, users = [], currentUser }) {
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("")
  const [priority, setPriority] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [assignedTo, setAssignedTo] = useState("")

  useEffect(() => {
    const handler = setTimeout(() => {
      onFiltersChange({
        search: search || undefined,
        status: status || undefined,
        priority: priority || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        assignedTo: assignedTo || undefined,
      })
    }, 300) // Debounce filter changes

    return () => clearTimeout(handler)
  }, [search, status, priority, startDate, endDate, assignedTo, onFiltersChange])

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 space-y-3">
      {/* 🔍 Search */}
      <input
        type="text"
        placeholder="Search tasks..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:border-blue-400"
      />

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {/* 🏷 Status */}
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-blue-400"
        >
          <option value="">All Status</option>
          <option value="open">Open</option>
          <option value="in-progress">In Progress</option>
          <option value="done">Done</option>
        </select>

        {/* ⚡ Priority */}
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-blue-400"
        >
          <option value="">All Priority</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        {/* 👤 Assigned User (visible only for Admins) */}
        {currentUser && currentUser.role === "admin" && (
          <select
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
            className="px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-blue-400"
          >
            <option value="">All Users</option>
            {users.map((user) => (
              <option key={user._id} value={user._id}>
                {user.name || user.email}
              </option>
            ))}
          </select>
        )}

        {/* 📅 Date Filters */}
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-blue-400"
          title="Start Date"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-blue-400"
          title="End Date"
        />
      </div>
    </div>
  )
}

export default TaskFilters
