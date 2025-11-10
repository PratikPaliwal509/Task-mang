import client from "./client"

export const tasksAPI = {
  getTasks: (filters = {}) => {
    // Clean up undefined/empty values
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value !== undefined && value !== '')
    )
    return client.get("/tasks", { params: cleanFilters })
  },

  createTask: (taskData) => client.post("/tasks", taskData),

  updateTask: (id, taskData) => client.patch(`/tasks/${id}`, taskData),

  deleteTask: (id) => client.delete(`/tasks/${id}`),

  // Deprecated: Use getTasks with assignedTo filter instead
  getTasksByAssignee: (userId) => client.get(`/tasks/assigned/${userId}`),

  // Comments
  getComments: (taskId) => client.get(`/tasks/${taskId}/comments`),
  addComment: (taskId, payload) => client.post(`/tasks/${taskId}/comments`, payload),
}
