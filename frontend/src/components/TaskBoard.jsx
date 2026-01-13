/**
 * Task Board Component
 * 
 * Displays tasks in a Kanban-style layout with columns for each status.
 * Responsibilities:
 * 1.  Fetch tasks from the API (initially or on refresh).
 * 2.  Organize tasks into columns (Todo, In Progress, etc.).
 * 3.  Handle drag-and-drop or status change interactions (via buttons).
 */

import React, { useEffect, useState } from 'react';
import { getTasks, updateTaskStatus } from '../api';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

// Define the columns and their associated styles (colors for light/dark mode)
const COLUMNS = {
  'Todos': 'bg-gray-200 dark:bg-gray-800',
  'In Progress': 'bg-blue-100 dark:bg-[#1e3a8a]', // Solid dark blue
  'Done': 'bg-green-100 dark:bg-[#14532d]', // Solid dark green
  'For Testing': 'bg-yellow-100 dark:bg-[#713f12]', // Solid dark yellow/brown
  'Deployment': 'bg-purple-100 dark:bg-[#581c87]' // Solid dark purple
};

const TaskBoard = ({ refreshTrigger }) => {
  const [tasks, setTasks] = useState([]);

  // --- Data Fetching ---
  useEffect(() => {
    fetchTasks();
  }, [refreshTrigger]); // Re-fetch whenever the parent component triggers a refresh

  const fetchTasks = async () => {
    try {
      const response = await getTasks();
      setTasks(response.data);
    } catch (error) {
      console.error("Failed to fetch tasks", error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [refreshTrigger]);

  const handleStatusChange = async (taskId, newStatus) => {
    // Optimistic Update: Update local state immediately for instant animation
    const previousTasks = [...tasks];
    setTasks(prevTasks => prevTasks.map(t => 
      t.id === taskId ? { ...t, status: newStatus } : t
    ));

    try {
      await updateTaskStatus(taskId, newStatus);
      // No need to fetch immediately if successful, as local state is already ahead.
      // But we can let the WebSocket event eventually trigger a re-sync if needed.
    } catch (error) {
      console.error("Failed to update status", error);
      setTasks(previousTasks); // Revert on failure
    }
  };

  const getTasksByStatus = (status) => tasks.filter(t => t.status === status);

  return (
    // Fixed height relative to viewport on XL screens, natural height on smaller screens
    <div className="flex flex-col xl:flex-row gap-4 w-full xl:h-[calc(100vh-12rem)] min-h-[500px] pb-4">
      {Object.entries(COLUMNS).map(([status, bgClass]) => (
        <div key={status} className="flex-1 relative p-[1px] rounded-[30px] bg-gradient-to-br from-white to-gray-500 flex flex-col">
          <div className={clsx("h-full w-full p-4 rounded-[29px] flex flex-col", bgClass)}>
            <h3 className="font-bold text-lg mb-4 text-gray-700 dark:text-gray-200 px-2 flex-shrink-0">{status}</h3>
            <div className="flex flex-col gap-3 flex-1 xl:overflow-y-auto pr-2">
            <AnimatePresence mode="popLayout">
            {getTasksByStatus(status).map(task => (
              <motion.div
                key={task.id}
                layoutId={task.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 350, 
                  damping: 25,
                  mass: 1 
                }}
                className="relative p-[1px] rounded-[30px] bg-gradient-to-br from-white to-gray-500 shadow hover:shadow-md"
              >
                <div className="bg-white dark:bg-gray-700 p-4 rounded-[29px]">
                  <h4 className="font-bold text-gray-900 dark:text-white">{task.title}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">{task.description}</p>
                <div className="mt-2 text-xs text-gray-400 dark:text-gray-500">ID: {task.id}</div>
                {/* Simple status mover for demo */}
                <div className="flex flex-wrap gap-1 mt-2">
                   {Object.keys(COLUMNS).map(s => (
                     s !== status && (
                       <button
                         key={s}
                         onClick={() => handleStatusChange(task.id, s)}
                         className={clsx(
                           "text-xs px-3 py-1 rounded-full font-medium transition-colors border",
                           {
                             'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 dark:hover:bg-gray-500': s === 'Todos',
                             'bg-blue-100 text-blue-600 border-blue-200 hover:bg-blue-200 dark:bg-blue-900/50 dark:text-blue-200 dark:border-blue-800': s === 'In Progress',
                             'bg-green-100 text-green-600 border-green-200 hover:bg-green-200 dark:bg-green-900/50 dark:text-green-200 dark:border-green-800': s === 'Done',
                             'bg-yellow-100 text-yellow-600 border-yellow-200 hover:bg-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-200 dark:border-yellow-800': s === 'For Testing',
                             'bg-purple-100 text-purple-600 border-purple-200 hover:bg-purple-200 dark:bg-purple-900/50 dark:text-purple-200 dark:border-purple-800': s === 'Deployment',
                           }
                         )}
                       >
                         {s}
                       </button>
                     )
                   ))}
                </div>
                </div>
              </motion.div>
            ))}
            </AnimatePresence>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TaskBoard;
