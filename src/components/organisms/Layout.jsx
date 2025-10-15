import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "@/components/organisms/Header";
import MobileSidebar from "@/components/organisms/MobileSidebar";
import Sidebar from "@/components/organisms/Sidebar";
import TaskForm from "@/components/organisms/TaskForm";

const Layout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const location = useLocation();

  const handleMenuClick = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleMobileMenuClose = () => {
    setIsMobileMenuOpen(false);
  };

  const handleAddClick = () => {
    if (location.pathname === "/tasks") {
      setIsTaskFormOpen(true);
      return;
    }
    // This will be handled by individual pages
    const event = new window.CustomEvent("addButtonClick");
    window.dispatchEvent(event);
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile Sidebar */}
      <MobileSidebar 
        isOpen={isMobileMenuOpen} 
        onClose={handleMobileMenuClose} 
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          onMenuClick={handleMenuClick}
          onAddClick={handleAddClick}
        />
<main className="flex-1 overflow-auto">
          <Outlet />
        </main>
        <TaskForm
          isOpen={isTaskFormOpen}
          onClose={() => setIsTaskFormOpen(false)}
          onSuccess={() => window.location.reload()}
        />
      </div>
    </div>
  );
};

export default Layout;