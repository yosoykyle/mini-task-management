/**
 * Project Info Modal Component
 * 
 * Displays details about the project and the list of team members.
 * Features:
 * 1.  Modal layout with backdrop blur.
 * 2.  Responsive design:
 *     - 2-column member list on desktop.
 *     - Stacked list on mobile with left-aligned header.
 * 3.  Custom scrollbar for overflow content.
 */

import React from 'react';

const ProjectInfo = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  // Hardcoded list of student members
  const members = [
    { id: "2023-00353-SP-0", name: "ARABACA, IRISH MAY NAAG" },
    { id: "2023-00354-SP-0", name: "BALUYOT, KYLE FAJARDO" },
    { id: "2023-00355-SP-0", name: "BASCARA, JHON PAUL MIJARES" },
    { id: "2023-00384-SP-0", name: "BERCASIO, SEBASTIEN JAY MILLENAS" },
    { id: "2023-00386-SP-0", name: "DIAZ, WARIEN MIAS" },
    { id: "2023-00369-SP-0", name: "HIC, EMMANUEL PALALLOS" },
    { id: "2023-00374-SP-0", name: "MANIQUIZ, STEPHANIE CRUZ" },
    { id: "2023-00375-SP-0", name: "MASBATE, GERVY SILVANO" },
    { id: "2023-00372-SP-0", name: "JAVIER, MARIA. REGINE MERCADO" },
    { id: "2023-00401-SP-0", name: "VALLEJERA, DAVID KRISTIAN VILLASANA" },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-4xl relative p-[1px] rounded-[40px] bg-gradient-to-br from-white to-gray-500 shadow-2xl max-h-[90vh] flex flex-col">
        <div className="bg-white dark:bg-gray-800 rounded-[39px] w-full h-full relative flex flex-col overflow-hidden">
        
        {/* Fixed Header Section (Non-scrolling) */}
        <div className="p-6 md:p-8 pb-4 flex-shrink-0 relative z-20 bg-white dark:bg-gray-800">
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="text-left md:text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-2">Mini Task Management</h2>
            <div className="inline-block bg-blue-100 dark:bg-blue-900/40 px-4 py-1 rounded-full">
              <p className="text-blue-600 dark:text-blue-300 font-medium text-sm">Group Final Project</p>
            </div>
          </div>
        </div>

        {/* Scrollable Content Section (Inset Scrollbar) */}
        <div className="overflow-y-auto px-6 md:px-8 pb-6 md:pb-8 pt-2 flex-grow custom-scrollbar">
          <div className="space-y-6">
            {/* Course Info */}
            <div className="relative p-[1px] rounded-[30px] bg-gradient-to-br from-white to-gray-500">
              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-[29px] h-full"> 
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 mb-1">Subject</p>
                    <p className="font-semibold text-gray-800 dark:text-gray-200">IT Elective 1: Event Driven Architecture</p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 mb-1">Course/Section</p>
                    <p className="font-semibold text-gray-800 dark:text-gray-200">BSIT 3-1</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300 mb-4 px-2">Project Members</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {members.map((member) => (
                  <div key={member.id} className="relative p-[1px] rounded-[20px] bg-gradient-to-br from-white to-gray-500">
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-[19px] flex flex-col h-full w-full">
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-mono mb-1">{member.id}</span>
                      <span className="font-semibold text-gray-800 dark:text-gray-200 text-sm">{member.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        </div>
      </div>
    </div>
  );
};

export default ProjectInfo;
