/**
 * Main Application Component
 * 
 * This is the root component of the Frontend application.
 * Responsibilities:
 * 1.  Initialize WebSocket connection for real-time updates.
 * 2.  Handle global toast notifications.
 * 3.  Maintain shared state (like 'refreshKey' to trigger sub-component updates).
 * 4.  Render the main layout, header, and child components.
 */

import React, { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useWebSocket from 'react-use-websocket';
import TaskBoard from './components/TaskBoard';
import CreateTask from './components/CreateTask';
import ProjectInfo from './components/ProjectInfo';

function App() {
  // State to trigger re-renders of the TaskBoard when an update occurs
  const [refreshKey, setRefreshKey] = useState(0);
  const [showProjectInfo, setShowProjectInfo] = useState(false);
  
  // --- Configuration ---
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";
  // Replace http/https with ws/wss and append /ws for WebSocket URL
  const WS_URL = API_BASE.replace(/^http/, 'ws') + '/ws';

  // --- WebSocket Hook ---
  // Connects to the backend and listens for messages
  const { lastJsonMessage } = useWebSocket(WS_URL, {
    shouldReconnect: () => true, // Auto-reconnect on disconnect
    onError: (e) => console.log("WebSocket error", e),
    onOpen: () => console.log("Connected to WebSocket"),
  });

  // --- Real-time Event Handling ---
  useEffect(() => {
    if (lastJsonMessage) {
      console.log("Got message:", lastJsonMessage);
      
      // Show toast based on event type received from Backend
      const evt = lastJsonMessage;
      if (evt.event_type === 'TASK_ASSIGNED') {
        toast.info(`Task Assigned! Task ID: ${evt.task_id} to User ${evt.assignee_id}`);
      } else if (evt.event_type === 'TASK_CREATED') {
        toast.success(`New Task Created: ${evt.title}`);
      } else if (evt.event_type === 'TASK_STATUS_UPDATED') {
        toast.info(`Task moved to ${evt.status}`);
      }
      
      // Increment refreshKey to tell TaskBoard to re-fetch tasks (if needed)
      // Note: Real-time apps might update state directly, but fetching is a safe fallback.
      setRefreshKey(prev => prev + 1);
    }
  }, [lastJsonMessage]);

  const handleTaskCreated = () => {
    setRefreshKey(prev => prev + 1);
  };

  // --- Theme Initialization ---
  useEffect(() => {
    // Enforce dark mode on startup
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Mini Task Management</h1>
            <button 
              onClick={() => setShowProjectInfo(true)}
              className="text-sm text-blue-500 hover:text-blue-400 dark:text-blue-400 dark:hover:text-blue-300 underline underline-offset-4 decoration-2 decoration-blue-500/30 hover:decoration-blue-500 transition-all"
            >
              Project Info & Members
            </button>
          </div>
        </header>

        {/* Action Button (Sticky) */}
        <CreateTask onTaskCreated={handleTaskCreated} />
        
        {/* Main Kanban Board */}
        <TaskBoard refreshTrigger={refreshKey} />
        
        {/* Project Info Modal */}
        <ProjectInfo isOpen={showProjectInfo} onClose={() => setShowProjectInfo(false)} />
        
        {/* Toast Notifications */}
        <ToastContainer position="bottom-center" theme="dark" />
      </div>
    </div>
  );
}

export default App;
