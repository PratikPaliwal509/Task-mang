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
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 space-y-6 shadow-xl">
      <div className="flex items-center px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-400/20">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
        </svg>
        <input
          type="text"
          placeholder="Search tasks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-3 py-1 bg-transparent text-white placeholder-slate-400 focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-400">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-200"
          >
            <option value="">All Status</option>
            <option value="open">Open</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-400">Priority</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-200"
          >
            <option value="">All Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        {currentUser && currentUser.role === "admin" && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-400">Assigned To</label>
            <select
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-200"
            >
              <option value="">All Users</option>
              {users.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.name || user.email}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-400">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-200"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-400">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-200"
          />
        </div>
      </div>
    </div>
  )
}

export default TaskFilters
