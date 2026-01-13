/**
 * Task Board Component
 * 
 * This is the main "Screen" where the action happens.
 * It works like a digital whiteboard with sticky notes.
 * 
 * Main Jobs:
 * 1.  **Fetch Data**: Ask the API for the list of tasks.
 * 2.  **Organize**: Sort those tasks into piles (Columns) based on their status.
 * 3.  **Display**: Show them as cards.
 * 4.  **Interact**: Let the user move cards between columns (by clicking buttons in this version).
 */

import React, { useEffect, useState } from 'react';
import { getTasks, updateTaskStatus } from '../api';
import { clsx } from 'clsx';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';

// Define the columns.
// Think of these as the labelled buckets we sort tasks into.
const COLUMNS = {
  'Todos': 'bg-gray-200 dark:bg-gray-800',
  'In Progress': 'bg-blue-100 dark:bg-[#1e3a8a]',
  'Done': 'bg-green-100 dark:bg-[#14532d]',
  'For Testing': 'bg-yellow-100 dark:bg-[#713f12]',
  'Deployment': 'bg-purple-100 dark:bg-[#581c87]'
};

const TaskBoard = ({ refreshTrigger }) => {
  // 'tasks' is our local list. Initially empty until we fetch from the backend.
  const [tasks, setTasks] = useState([]);

  // --- Data Fetching ---
  // When 'refreshTrigger' changes (the bell rings from App.js), run this.
  useEffect(() => {
    fetchTasks();
  }, [refreshTrigger]);

  const fetchTasks = async () => {
    try {
      // 1. Call the API (Waiter)
      const response = await getTasks();
      // 2. Save the result to our local state so React draws it.
      setTasks(response.data);
    } catch (error) {
      console.error("Failed to fetch tasks", error);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    // --- Optimistic Update ---
    // Instead of waiting for the Server to say "OK", we update the screen IMMEDIATELY.
    // This makes the app feel super fast (Snappy).
    const previousTasks = [...tasks];
    setTasks(prevTasks => prevTasks.map(t => 
      t.id === taskId ? { ...t, status: newStatus } : t
    ));

    try {
      // Now we tell the server "Hey, I moved this."
      await updateTaskStatus(taskId, newStatus);
    } catch (error) {
      // If the server says "Error!", we revert the change on the screen so it matches reality.
      console.error("Failed to update status", error);
      setTasks(previousTasks);
    }
  };

  // Helper to filter the big list of tasks into just the ones for a specific column.
  const getTasksByStatus = (status) => tasks.filter(t => t.status === status);

  return (
    <div className="flex flex-col xl:flex-row gap-4 w-full xl:h-[calc(100vh-12rem)] min-h-[500px] pb-4">
      {/* LayoutGroup helps Framer Motion animate items moving between lists smoothly */}
      <LayoutGroup>
      {Object.entries(COLUMNS).map(([status, bgClass]) => (
        <div key={status} className="flex-1 relative p-[1px] rounded-[30px] bg-gradient-to-br from-white to-gray-500 flex flex-col">
          <div className={clsx("h-full w-full p-4 rounded-[29px] flex flex-col", bgClass)}>
            <h3 className="font-bold text-lg mb-4 text-gray-700 dark:text-gray-200 px-2 flex-shrink-0">{status}</h3>
            
            {/* The task container for this column */}
            <div className="flex flex-col gap-3 flex-1 xl:overflow-y-auto pr-2 min-h-[50px]">
            <AnimatePresence>
            {getTasksByStatus(status).map(task => (
              <motion.div
                key={task.id}
                layoutId={task.id} // Unique ID helps Framer Motion track this specific card across columns
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 350, 
                  damping: 25, 
                  mass: 1 
                }}
                className="relative p-[1px] rounded-[30px] bg-gradient-to-br from-white to-gray-500 shadow hover:shadow-md hover:z-20"
              >
                <div className="bg-white dark:bg-gray-700 p-4 rounded-[29px]">
                  <h4 className="font-bold text-gray-900 dark:text-white">{task.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{task.description}</p>
                  <div className="mt-2 text-xs text-gray-400 dark:text-gray-500">ID: {task.id}</div>
                  
                  {/* Buttons to move the task (Simple Controls) */}
                  <div className="flex flex-wrap gap-1 mt-2">
                     {Object.keys(COLUMNS).map(s => (
                       s !== status && (
                         <button
                           key={s}
                           onClick={() => handleStatusChange(task.id, s)}
                           className={clsx(
                             "text-xs px-3 py-1 rounded-full font-medium transition-all border",
                             // Extensive conditional styling for buttons...
                             {
                               'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 dark:hover:bg-gray-500': s === 'Todos',
                               'bg-blue-100 text-blue-600 border-blue-200 hover:bg-blue-200 dark:bg-blue-900/50 dark:text-blue-200 dark:border-blue-800 dark:hover:bg-blue-800': s === 'In Progress',
                               'bg-green-100 text-green-600 border-green-200 hover:bg-green-200 dark:bg-green-900/50 dark:text-green-200 dark:border-green-800 dark:hover:bg-green-800': s === 'Done',
                               'bg-yellow-100 text-yellow-600 border-yellow-200 hover:bg-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-200 dark:border-yellow-800 dark:hover:bg-yellow-800': s === 'For Testing',
                               'bg-purple-100 text-purple-600 border-purple-200 hover:bg-purple-200 dark:bg-purple-900/50 dark:text-purple-200 dark:border-purple-800 dark:hover:bg-purple-800': s === 'Deployment',
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
      </LayoutGroup>
    </div>
  );
};

export default TaskBoard;
