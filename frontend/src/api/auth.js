import client from "./client"

export const authAPI = {
  register: (email, password, name, role) => client.post("/auth/register", { email, password, name, role }),

  login: (email, password) => client.post("/auth/login", { email, password }),

  getCurrentUser: () => client.get("/users/me"),
}
