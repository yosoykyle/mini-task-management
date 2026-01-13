/**
 * API Service Module
 *
 * This file is the "Messenger" or "Phone Line".
 *
 * Instead of component files talking directly to the outside world,
 * they give their messages to this file, and this file handles the actual calling.
 *
 * It uses 'axios', which is like a web browser in code form.
 */

import axios from "axios";

// Get API URL from .env, default to localhost
// This is the "Phone Number" of the backend.
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Create a configured instance (like saving the contact number)
const api = axios.create({
  baseURL: API_URL,
});

// --- Task API Calls ---
// These functions correspond to the "Menu Items" the backend offers.

/**
 * GET all tasks.
 * Analogy: Asking the waiter "What is on the list?"
 */
export const getTasks = () => api.get("/api/tasks");

/**
 * POST (Create) a new task.
 * Analogy: Filling out an order form and giving it to the kitchen.
 * @param {object} task - The data to send (title, description).
 */
export const createTask = (task) => api.post("/api/tasks", task);

/**
 * PATCH (Update) a task status.
 * Analogy: Telling the waiter "I changed my mind, I want this done now."
 * We use PATCH because we are only changing *part* of the task (the status), not the whole thing.
 */
export const updateTaskStatus = (id, status) =>
  api.patch(`/api/tasks/${id}`, { status });

/**
 * DELETE a task.
 * Analogy: Asking the waiter to throw away a bad order.
 */
export const deleteTask = (id) => api.delete(`/api/tasks/${id}`);

/**
 * PUT (Assign) a user to a task.
 * Analogy: Pointing to a chef and saying "You cook this one."
 */
export const assignTask = (id, userId) =>
  api.put(`/api/tasks/${id}/assign/${userId}`);

// --- User API Calls ---

/**
 * GET all users.
 * Analogy: "Who is working today?"
 */
export const getUsers = () => api.get("/api/users");

/**
 * POST a new user.
 * Analogy: Hiring a new staff member.
 */
export const createUser = (user) => api.post("/api/users", user);

// Export the default api instance in case we need to make custom calls elsewhere.
export default api;
