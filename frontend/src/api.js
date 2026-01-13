/**
 * API Service Module
 *
 * Handles all HTTP requests to the Backend API using Axios.
 * - Base URL is configured from environment variables.
 * - Endpoints: Tasks CRUD.
 */

import axios from "axios";

// Get API URL from .env, default to localhost
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_URL,
});

// --- Task API Calls ---

/**
 * Fetches all tasks from the API.
 * @returns {Promise<AxiosResponse>} A promise that resolves to the API response containing tasks.
 */
export const getTasks = () => api.get("/api/tasks");

/**
 * Creates a new task.
 * @param {object} task - The task object to create.
 * @returns {Promise<AxiosResponse>} A promise that resolves to the API response containing the created task.
 */
export const createTask = (task) => api.post("/api/tasks", task);

/**
 * Updates the status of a specific task.
 * @param {string} id - The ID of the task to update.
 * @param {string} status - The new status for the task.
 * @returns {Promise<AxiosResponse>} A promise that resolves to the API response.
 */
export const updateTaskStatus = (id, status) =>
  api.patch(`/api/tasks/${id}`, { status });

/**
 * Deletes a specific task.
 * @param {string} id - The ID of the task to delete.
 * @returns {Promise<AxiosResponse>} A promise that resolves to the API response.
 */
export const deleteTask = (id) => api.delete(`/api/tasks/${id}`);

/**
 * Assigns a task to a user.
 * @param {string} id - The ID of the task to assign.
 * @param {string} userId - The ID of the user to assign the task to.
 * @returns {Promise<AxiosResponse>} A promise that resolves to the API response.
 */
export const assignTask = (id, userId) =>
  api.put(`/api/tasks/${id}/assign/${userId}`);

// --- User API Calls ---

/**
 * Fetches all users from the API.
 * @returns {Promise<AxiosResponse>} A promise that resolves to the API response containing users.
 */
export const getUsers = () => api.get("/api/users");

/**
 * Creates a new user.
 * @param {object} user - The user object to create.
 * @returns {Promise<AxiosResponse>} A promise that resolves to the API response containing the created user.
 */
export const createUser = (user) => api.post("/api/users", user);

export default api;
