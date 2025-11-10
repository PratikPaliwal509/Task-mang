"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { FaSignOutAlt } from "react-icons/fa"
import TaskList from "../components/TaskList"
import TaskForm from "../components/TaskForm"
import TaskFilters from "../components/TaskFilters"
import TaskStats from "../components/TaskStats"
import TaskBoard from "../components/TaskBoard"
import UsersList from "../components/UsersList"
import { usersAPI } from "../api/users"

function Dashboard() {
  const [user, setUser] = useState(null)
  const [tasks, setTasks] = useState([])
  const [filters, setFilters] = useState({})
  const [activeTab, setActiveTab] = useState("list")
  const [showForm, setShowForm] = useState(false)
  const [users, setUsers] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser)
      setUser(parsedUser)
      
      // Fetch users if the current user is an admin
      if (parsedUser.role === "admin") {
        const fetchUsers = async () => {
          try {
            const response = await usersAPI.getAllUsers()
            setUsers(response.data.users)
          } catch (err) {
            console.error("Failed to fetch users:", err)
          }
        }
        fetchUsers()
      }
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    navigate("/login")
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-white">Task Manager</h1>
            {user && (
              <div className="text-slate-300 text-sm">
                <p>
                  {user.name} <span className="text-blue-400">({user.role})</span>
                </p>
              </div>
            )}
          </div>
          <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded flex items-center gap-2">
            <FaSignOutAlt />
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <TaskStats tasks={tasks} />
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-slate-700">
          <button
            onClick={() => setActiveTab("list")}
            className={`px-4 py-2 font-semibold transition-colors ${
              activeTab === "list" ? "text-blue-400 border-b-2 border-blue-400" : "text-slate-400 hover:text-slate-300"
            }`}
          >
            List View
          </button>
          <button
            onClick={() => setActiveTab("board")}
            className={`px-4 py-2 font-semibold transition-colors ${
              activeTab === "board" ? "text-blue-400 border-b-2 border-blue-400" : "text-slate-400 hover:text-slate-300"
            }`}
          >
            Board View
          </button>
          {user?.role === "admin" && (
            <button
              onClick={() => setActiveTab("users")}
              className={`px-4 py-2 font-semibold transition-colors ${
                activeTab === "users"
                  ? "text-blue-400 border-b-2 border-blue-400"
                  : "text-slate-400 hover:text-slate-300"
              }`}
            >
              Users
            </button>
          )}
        </div>

        {/* Content */}
        <div className="space-y-6">
          {activeTab === "users" && user?.role === "admin" ? (
            <UsersList />
          ) : (
            <>
              <div className="flex justify-end mb-4">
                <button
                  onClick={() => setShowForm(!showForm)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold whitespace-nowrap transition-all duration-200 transform hover:scale-105 flex items-center gap-2 shadow-lg"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  {showForm ? "Cancel" : "New Task"}
                </button>
              </div>
              
              <div className="mb-6">
                <TaskFilters 
                  onFiltersChange={setFilters} 
                  currentUser={user} 
                  users={users.filter(u => u.role !== "admin")} 
                />
              </div>

              {showForm && (
                <TaskForm
                  onTaskCreated={() => {
                    setShowForm(false);
                    // Force task list to refresh by triggering a filters update
                    setFilters({ ...filters });
                  }}
                />
              )}

              {activeTab === "list" ? (
                <TaskList filters={filters} onTasksLoaded={setTasks} />
              ) : (
                <TaskBoard filters={filters} onTasksLoaded={setTasks} />
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}

export default Dashboard
