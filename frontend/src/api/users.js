import client from "./client"

export const usersAPI = {
    getAllUsers: () => client.get("/users"),
}