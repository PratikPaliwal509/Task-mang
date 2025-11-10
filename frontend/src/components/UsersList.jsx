"use client"

import { useState, useEffect } from "react"
import { usersAPI } from "../api/users"
import { FaUserShield, FaUserAlt } from "react-icons/fa"

function UsersList() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await usersAPI.getAllUsers()
      setUsers(response.data.users)
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch users")
    } finally {
      setLoading(false)
    }
  }

  if (loading)
    return (
      <div className="flex items-center justify-center h-40 text-slate-300 animate-pulse">
        Loading users...
      </div>
    )

  if (error)
    return (
      <div className="text-center text-red-400 bg-red-900/20 border border-red-800 rounded-lg p-4">
        {error}
      </div>
    )

  return (
    <div className="bg-gradient-to-b from-slate-900 to-slate-800 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-md transition-all duration-300 hover:shadow-blue-900/30">
      <div className="p-4 border-b border-slate-700 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-white tracking-wide flex items-center gap-2">
          👥 User Management
        </h2>
        <span className="text-sm text-slate-400">{users.length} Users Found</span>
      </div>

      <table className="w-full text-left">
        <thead>
          <tr className="bg-slate-800/70 text-slate-300 uppercase text-sm tracking-wider">
            <th className="px-6 py-3">Name</th>
            <th className="px-6 py-3">Email</th>
            <th className="px-6 py-3 text-center">Role</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, i) => (
            <tr
              key={user._id}
              className={`transition-all duration-300 hover:bg-slate-700/50 ${
                i % 2 === 0 ? "bg-slate-800/60" : "bg-slate-900/40"
              }`}
            >
              <td className="px-6 py-4 text-white font-medium">{user.name}</td>
              <td className="px-6 py-4 text-slate-300">{user.email}</td>
              <td className="px-6 py-4 text-center">
                <span
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide shadow-md ${
                    user.role === "admin"
                      ? "bg-gradient-to-r from-red-700 to-red-600 text-red-100"
                      : "bg-gradient-to-r from-blue-700 to-blue-600 text-blue-100"
                  }`}
                >
                  {user.role === "admin" ? (
                    <>
                      <FaUserShield className="text-sm" /> Admin
                    </>
                  ) : (
                    <>
                      <FaUserAlt className="text-sm" /> User
                    </>
                  )}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {users.length === 0 && (
        <div className="text-slate-400 text-center py-10 text-sm">
          No users found. Try again later.
        </div>
      )}
    </div>
  )
}

export default UsersList
