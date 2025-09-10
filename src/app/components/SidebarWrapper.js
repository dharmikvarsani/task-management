"use client";
import { useAuth } from "@/hooks/useAuth";
import { usePathname } from "next/navigation";
import { Sidebar } from "./ui/Sidebar";
import { useState, useEffect } from "react";
import { Menu, useMediaQuery } from "@mui/material";

export default function SidebarWrapper({ children }) {
  const { user } = useAuth();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width:1024px)");

  useEffect(() => {
    if (!isDesktop) {
      setSidebarOpen(false);
    }
  }, [pathname, isDesktop]);

  useEffect(() => {
    if (isDesktop) {
      setSidebarOpen(true);
    } else {
      setSidebarOpen(false);
    }
  }, [isDesktop]);

  if (!user || pathname === "/logIn") {
    return <div>{children}</div>;
  }

  return (
    <div className="flex min-h-screen">
      {!isDesktop && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed top-4 left-4 z-30 p-2 bg-indigo-600 text-white rounded-md shadow-lg lg:hidden"
        >
          <Menu />
        </button>
      )}

      <aside className="flex-shrink-0">
        <Sidebar 
          role={user.role} 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
        />
      </aside>
      
      <main
        className={`flex-1 p-6 overflow-auto bg-gray-50 dark:bg-gray-800 transition-all duration-300 ${
          isDesktop && !sidebarOpen ? "lg:ml-16" : "lg:ml-0"
        }`}
      >
        {isDesktop && (
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="fixed bottom-4 left-2 z-30 bg-indigo-600 text-white p-1 rounded shadow-lg"
          >
            {sidebarOpen ? "<" : ">"}
          </button>
        )}
        
        {children}
      </main>
    </div>
  );
}