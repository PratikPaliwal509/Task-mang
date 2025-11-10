"use client"

import { useState, useEffect } from "react"
import { usersAPI } from "../api/users"

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

  if (loading) return <div className="text-white">Loading users...</div>
  if (error) return <div className="text-red-400">{error}</div>

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-slate-700 border-b border-slate-600">
          <tr>
            <th className="px-6 py-3 text-left text-white font-semibold">Name</th>
            <th className="px-6 py-3 text-left text-white font-semibold">Email</th>
            <th className="px-6 py-3 text-left text-white font-semibold">Role</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id} className="border-b border-slate-700 hover:bg-slate-700">
              <td className="px-6 py-3 text-white">{user.name}</td>
              <td className="px-6 py-3 text-slate-300">{user.email}</td>
              <td className="px-6 py-3">
                <span
                  className={`px-2 py-1 rounded text-sm ${
                    user.role === "admin" ? "bg-red-900 text-red-200" : "bg-blue-900 text-blue-200"
                  }`}
                >
                  {user.role}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default UsersList
