/**
 * Main Application Component
 * 
 * Think of this file as the "Conductor" of the orchestra.
 * 
 * It manages the big picture stuff:
 * 1.  **The Phone Line (WebSocket)**: Listening for instant updates from the backend.
 * 2.  **Notification System**: Popping up those little "Toast" messages when something happens.
 * 3.  **Layout**: Deciding where the Header, Create Button, and Board go on the screen.
 */

import React, { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useWebSocket from 'react-use-websocket';
import TaskBoard from './components/TaskBoard';
import CreateTask from './components/CreateTask';
import ProjectInfo from './components/ProjectInfo';

function App() {
  // --- STATE ---
  // "State" is the memory of the app.
  
  // refreshKey: A simple counter. When we change this number, the TaskBoard knows it needs to re-fetch data.
  // It's like ringing a bell to say "Dinner's ready, come check the table!"
  const [refreshKey, setRefreshKey] = useState(0);
  const [showProjectInfo, setShowProjectInfo] = useState(false);
  
  // --- Configuration ---
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";
  // Convert http:// to ws:// because WebSockets use a different protocol (like switching from AM back to FM radio)
  const WS_URL = API_BASE.replace(/^http/, 'ws') + '/ws';

  // --- WebSocket Hook ---
  // This is the "Ear" of the app. It connects to the backend and listens.
  const { lastJsonMessage } = useWebSocket(WS_URL, {
    shouldReconnect: () => true, // If the internet flickers, try to connect again automatically.
    onError: (e) => console.log("WebSocket error", e),
    onOpen: () => console.log("Connected to WebSocket"),
  });

  // --- Real-time Event Handling ---
  // "useEffect" means: "Run this code whenever the thing in the brackets [] changes."
  useEffect(() => {
    if (lastJsonMessage) {
      console.log("Got message:", lastJsonMessage);
      
      // 1. Show a popup (Toast) to the user so they know what happened.
      const evt = lastJsonMessage;
      if (evt.event_type === 'TASK_ASSIGNED') {
        toast.info(`Task Assigned! Task ID: ${evt.task_id} to User ${evt.assignee_id}`);
      } else if (evt.event_type === 'TASK_CREATED') {
        toast.success(`New Task Created: ${evt.title}`);
      } else if (evt.event_type === 'TASK_STATUS_UPDATED') {
        toast.info(`Task moved to ${evt.status}`);
      }
      
      // 2. Ring the bell (increment refreshKey) so the Board updates its data.
      setRefreshKey(prev => prev + 1);
    }
  }, [lastJsonMessage]);

  const handleTaskCreated = () => {
    // Also ring the bell when WE create a task ourselves.
    setRefreshKey(prev => prev + 1);
  };

  // --- Theme Initialization ---
  useEffect(() => {
    // Force Dark Mode because it looks cooler.
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
        {/* We pass 'handleTaskCreated' to it so it can tell us when it's done. */}
        <CreateTask onTaskCreated={handleTaskCreated} />
        
        {/* Main Kanban Board */}
        {/* We pass 'refreshKey' to it. When the key changes, the board re-loads. */}
        <TaskBoard refreshTrigger={refreshKey} />
        
        {/* Project Info Modal */}
        <ProjectInfo isOpen={showProjectInfo} onClose={() => setShowProjectInfo(false)} />
        
        {/* Toast Notifications Container (Invisible until a message pops up) */}
        <ToastContainer position="bottom-center" theme="dark" />
      </div>
    </div>
  );
}

export default App;
