export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

export const validatePassword = (password) => {
  return password.length >= 6
}

export const validateTaskTitle = (title) => {
  return title && title.trim().length > 0
}

export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export const isTaskOverdue = (dueDate) => {
  if (!dueDate) return false
  return new Date(dueDate) < new Date()
}

export const getPriorityColor = (priority) => {
  const colors = {
    high: "text-red-400",
    medium: "text-yellow-400",
    low: "text-blue-400",
  }
  return colors[priority] || colors.medium
}

export const getStatusBadgeColor = (status) => {
  const colors = {
    open: "bg-yellow-900 text-yellow-200",
    "in-progress": "bg-blue-900 text-blue-200",
    done: "bg-green-900 text-green-200",
  }
  return colors[status] || colors.open
}
