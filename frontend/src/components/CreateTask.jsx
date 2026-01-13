/**
 * Create Task Component (Sticky Modal)
 * 
 * This file handles two things:
 * 1.  **The Floating Button**: The blue "+" button at the bottom right.
 * 2.  **The Form Modal**: The popup window where you actually type the task details.
 * 
 * It's "Sticky" because it stays in the same place even when you scroll.
 */

import React, { useState } from 'react';
import { createTask } from '../api';

const CreateTask = ({ onTaskCreated }) => {
  // --- STATE ---
  // isOpen: Is the popup showing? (true/false)
  // title, description: Temporary storage for what the user types.
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  // --- Form Submission ---
  // What happens when the user clicks "Create Task".
  const handleSubmit = async (e) => {
    e.preventDefault(); // Stop the page from reloading (default browser behavior).
    if (!title) return; // Don't let them submit an empty task.

    try {
      // 1. Send data to the API.
      await createTask({ title, description });
      
      // 2. Clean up (clear the form and close the window).
      setTitle('');
      setDescription('');
      setIsOpen(false);
      
      // 3. Tell the Parent (App.jsx) "I'm done, refresh the list!"
      if (onTaskCreated) onTaskCreated(); 
    } catch (error) {
      console.error("Failed to create task", error);
    }
  };

  // --- Conditional Rendering ---
  // If the modal is CLOSED (!isOpen), we only show the floating button.
  if (!isOpen) {
    return (
      <div className="fixed bottom-8 right-8 p-[1px] rounded-full bg-gradient-to-br from-white to-gray-500 z-50 shadow-xl group">
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700"
          title="Add New Task"
        >
          {/* SVG Icon for the Plus sign */}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
    );
  }

  // If the modal is OPEN, we show the full form overlay.
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      {/* Modal Container */}
      <div className="w-full max-w-md relative p-[1px] rounded-[30px] bg-gradient-to-br from-white to-gray-500 shadow-2xl">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-[29px] w-full h-full relative">
        
        {/* Close Button ("X" icon) */}
        <button 
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="text-2xl font-bold mb-6 px-2 text-gray-800 dark:text-white">New Task</h2>
        
        {/* The Input Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-600 dark:text-gray-300 px-1">Title</label>
            <div className="relative p-[1px] rounded-2xl bg-gradient-to-br from-white to-gray-500 flex">
              <input
                type="text"
                placeholder="What needs to be done?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-[15px] focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 block flex-1"
                required
                autoFocus
              />
            </div>
          </div>
          
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-600 dark:text-gray-300 px-1">Description</label>
            <div className="relative p-[1px] rounded-2xl bg-gradient-to-br from-white to-gray-500 flex">
              <textarea
                placeholder="Add details..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-[15px] focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 min-h-[100px] resize-none block flex-1"
              />
            </div>
          </div>

          <div className="mt-2 p-[1px] rounded-full bg-gradient-to-br from-white to-gray-500 shadow-lg group">
            <button 
              type="submit" 
              className="w-full py-3 rounded-full bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-blue-200 dark:shadow-none"
            >
              Create Task
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
};

export default CreateTask;
