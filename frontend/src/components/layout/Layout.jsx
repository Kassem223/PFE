import React from 'react';
import { Outlet } from 'react-router-dom';
import SidebarComponent from '../sidebar/sidebarComponent';
import ChatBot from '../chatbot/ChatBot';


const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col">
      <div className="flex flex-1">
        <SidebarComponent />
        <main className="flex-1 overflow-auto">
          {children || <Outlet />}
        </main>
      </div>
      <ChatBot />
    </div>
  );
};

export default Layout;
