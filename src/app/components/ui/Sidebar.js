"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useMediaQuery } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import {
  Home,
  PersonAdd,
  Assignment,
  Groups,
  ListAlt,
  ExpandMore,
  ExpandLess,
  AddTask,
  Menu,
  Close,
} from "@mui/icons-material";

export const Sidebar = ({ role, isOpen, onClose }) => {
  const [usersMenuOpen, setUsersMenuOpen] = useState(false);
  const [tasksMenuOpen, setTasksMenuOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width:1024px)");
  const pathname = usePathname();

  const routes = [
    { path: "/", label: "Home", icon: <Home /> },
    ...(role === "manager"
      ? [
        {
          label: "Users",
          icon: <PersonAdd />,
          children: [
            { path: "/users/new", label: "Create User", icon: <PersonAdd /> },
            { path: "/users", label: "User List", icon: <ListAlt /> },
          ],
        },
        {
          label: "Tasks",
          icon: <Assignment />,
          children: [
            { path: "/tasks/new", label: "Create Task", icon: <AddTask /> },
            { path: "/tasks", label: "Task List", icon: <ListAlt /> },
          ],
        },
        { path: "/tasks/team", label: "Teams", icon: <Groups /> },
      ]
      : []),
    ...(role === "tl" || role === "developer"
      ? [
        { path: "/tasks/team", label: "My Team", icon: <Groups /> },
        {
          label: "My Tasks",
          icon: <Assignment />,
          children: [
            { path: "/tasks", label: "Task List", icon: <ListAlt /> },
          ],
        },
      ]
      : []),
  ];

  const renderRoute = (r) => {
    const isActive = pathname === r.path;

    if (r.children) {
      const isUsersMenu = r.label === "Users";
      const isTasksMenu = r.label === "Tasks" || r.label === "My Tasks";
      const isOpen = isUsersMenu ? usersMenuOpen : tasksMenuOpen;
      const setOpen = isUsersMenu ? setUsersMenuOpen : setTasksMenuOpen;

      return (
        <div key={r.label}>
          <div
            className={`flex items-center justify-between rounded-lg p-3 cursor-pointer transition-all ${isOpen
                ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400"
                : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            onClick={() => setOpen(!isOpen)}
          >
            <div className="flex items-center gap-3">
              <div className="w-8">
                {React.cloneElement(r.icon, {
                  sx: { fontSize: 20, color: isOpen ? "#4f46e5" : "#6b7280" },
                })}
              </div>
              <span className="font-medium text-sm">{r.label}</span>
            </div>
            {isOpen ? <ExpandLess /> : <ExpandMore />}
          </div>

          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="ml-5 flex flex-col space-y-1"
              >
                {r.children.map((child) => {
                  const childActive = pathname === child.path;
                  return (
                    <Link key={child.path} href={child.path} onClick={!isDesktop ? onClose : undefined}>
                      <div
                        className={`flex items-center rounded-lg p-2 pl-3 cursor-pointer transition-all ${childActive
                            ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400"
                            : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                          }`}
                      >
                        <div className="w-6">
                          {React.cloneElement(child.icon, { sx: { fontSize: 18 } })}
                        </div>
                        <span className="ml-2 text-sm font-medium">
                          {child.label}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    }

    return (
      <Link key={r.path} href={r.path} onClick={!isDesktop ? onClose : undefined}>
        <div
          className={`flex items-center rounded-lg p-3 transition-all cursor-pointer ${isActive
              ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400"
              : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
        >
          <div className="w-8 mr-3">
            {React.cloneElement(r.icon, {
              sx: { fontSize: 20, color: isActive ? "#4f46e5" : "#6b7280" },
            })}
          </div>
          <span className="font-medium text-sm">{r.label}</span>
        </div>
      </Link>
    );
  };

  return (
    <>
      <AnimatePresence>
        {!isDesktop && isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <motion.div
        initial={isDesktop ? false : { x: -300 }}
        animate={{
          x: isDesktop || isOpen ? 0 : -300,
          width: isDesktop ? (isOpen ? 256 : 64) : 256
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={`fixed lg:relative h-full flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 shadow-sm z-50 ${isDesktop ? (isOpen ? "w-64" : "w-16") : "w-64"
          }`}
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center">
              <Assignment sx={{ color: "white", fontSize: 20 }} />
            </div>
            {isOpen && (
              <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                TaskFlow
              </h2>
            )}
          </div>
          {!isDesktop && isOpen && (
            <button onClick={onClose} className="lg:hidden">
              <Close />
            </button>
          )}
        </div>

        <div className="flex-1 p-2 overflow-y-auto space-y-1">
          {routes.map(renderRoute)}
        </div>
      </motion.div>
    </>
  );
};