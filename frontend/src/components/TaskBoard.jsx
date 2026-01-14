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
import { motion, AnimatePresence, LayoutGroup, useAnimation } from 'framer-motion';

// Define the columns.
// Think of these as the labelled buckets we sort tasks into.
const COLUMNS = {
  'Todos': 'bg-gray-200 dark:bg-gray-800',
  'In Progress': 'bg-blue-100 dark:bg-[#1e3a8a]',
  'Done': 'bg-green-100 dark:bg-[#14532d]',
  'For Testing': 'bg-yellow-100 dark:bg-[#713f12]',
  'Deployment': 'bg-purple-100 dark:bg-[#581c87]'
};

const TaskBoard = ({ refreshTrigger, lastEvent }) => {
  // 'tasks' is our local list. Initially empty until we fetch from the backend.
  const [tasks, setTasks] = useState([]);

  // Animation controls for each column (to trigger the blink)
  // We create a stable object where keys match the COLUMNS keys.
  const columnControls = {
    'Todos': useAnimation(),
    'In Progress': useAnimation(),
    'Done': useAnimation(),
    'For Testing': useAnimation(),
    'Deployment': useAnimation(),
  };

  // --- Data Fetching ---
  // When 'refreshTrigger' changes (the bell rings from App.js), run this.
  useEffect(() => {
    fetchTasks();
  }, [refreshTrigger]);

  // --- Blink Effect Logic ---
  // Watch for new events and flash the correct column.
  useEffect(() => {
    if (lastEvent) {
      let targetColumn = null;

      if (lastEvent.event_type === 'TASK_CREATED') {
        // New tasks always go to "Todos" initially
        targetColumn = 'Todos';
      } else if (lastEvent.event_type === 'TASK_STATUS_UPDATED') {
        // Tasks moved to a new status
        targetColumn = lastEvent.status;
      }

      if (targetColumn && columnControls[targetColumn]) {
        // Trigger the "Tone Up" animation (Flash Brighter)
        // Brightness goes: 1 -> 1.3 -> 1 -> 1.3 -> 1
        columnControls[targetColumn].start({
          filter: ["brightness(1)", "brightness(1.5)", "brightness(1)", "brightness(2)", "brightness(1)"],
          transition: { duration: 1 }
        });
      }
    }
  }, [lastEvent]);

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
      {Object.entries(COLUMNS).map(([status, bgClass], index) => {
        const tasksInColumn = getTasksByStatus(status);
        
        return (
        <motion.div 
          key={status} 
          className="flex-1 relative p-[1px] rounded-[30px] bg-gradient-to-br from-white to-gray-500 flex flex-col"
          initial={{ opacity: 0, y: 50 }}
          animate={columnControls[status]} // Use the manual control instead of just 'opacity: 1'
          whileInView={{ opacity: 1, y: 0 }} // Ensure it appears initially if controls haven't started (fallback)
          viewport={{ once: true }}
          transition={{ 
            duration: 0.5,
            delay: index * 0.1, 
            type: "spring",
            stiffness: 100
          }}
        >
          <div className={clsx("h-full w-full p-4 rounded-[29px] flex flex-col", bgClass)}>
            {/* Column Header with Counter */}
            <div className="flex justify-between items-center mb-4 px-2">
              <h3 className="font-bold text-lg text-gray-700 dark:text-gray-200">{status}</h3>
              <span className="bg-white/50 dark:bg-black/20 text-gray-700 dark:text-gray-200 text-xs font-bold px-3 py-1 rounded-full backdrop-blur-sm">
                {tasksInColumn.length}
              </span>
            </div>
            
            {/* The task container for this column */}
            <div className="flex flex-col gap-3 flex-1 xl:overflow-y-auto pr-2 min-h-[50px] custom-scrollbar">
            <AnimatePresence>
            {tasksInColumn.map(task => (
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
                className="relative p-[1px] rounded-[24px] bg-gradient-to-br from-white to-gray-400 shadow-sm hover:shadow-lg hover:z-20 group"
              >
                <div className="bg-white dark:bg-gray-700 p-4 rounded-[23px] flex flex-col gap-2">
                  {/* Card Header: Title and ID */}
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="font-bold text-gray-900 dark:text-white leading-tight">{task.title}</h4>
                    <span className="text-[10px] font-mono text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md flex-shrink-0">
                      #{task.id}
                    </span>
                  </div>

                  {/* Description */}
                  {task.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
                      {task.description}
                    </p>
                  )}
                  
                  {/* Meta Info (Date) */}
                  <div className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
                    {new Date(task.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>

                  {/* Action Buttons (Move To) */}
                  <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-600">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-2 font-semibold">Move to:</p>
                    <div className="flex flex-wrap gap-1.5">
                       {Object.keys(COLUMNS).map(s => (
                         s !== status && (
                           <button
                             key={s}
                             onClick={() => handleStatusChange(task.id, s)}
                             className={clsx(
                               "text-[10px] px-2.5 py-1 rounded-lg font-medium transition-all border shadow-sm",
                               {
                                 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 dark:hover:bg-gray-500': s === 'Todos',
                                 'bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-200 dark:border-blue-800 dark:hover:bg-blue-900/50': s === 'In Progress',
                                 'bg-green-50 text-green-600 border-green-100 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-200 dark:border-green-800 dark:hover:bg-green-900/50': s === 'Done',
                                 'bg-yellow-50 text-yellow-600 border-yellow-100 hover:bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-200 dark:border-yellow-800 dark:hover:bg-yellow-900/50': s === 'For Testing',
                                 'bg-purple-50 text-purple-600 border-purple-100 hover:bg-purple-100 dark:bg-purple-900/30 dark:text-purple-200 dark:border-purple-800 dark:hover:bg-purple-900/50': s === 'Deployment',
                               }
                             )}
                           >
                             {s}
                           </button>
                         )
                       ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
            </AnimatePresence>
            </div>
          </div>
        </motion.div>
      )})}
      </LayoutGroup>
    </div>
  );
};

export default TaskBoard;
