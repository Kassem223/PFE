import React from 'react';
import { Outlet } from 'react-router-dom';
import SidebarComponent from '../sidebar/sidebarComponent';
import ChatBot from '../chatbot/ChatBot';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#161316] flex">
      <SidebarComponent />
      <main className="flex-1 overflow-auto min-h-screen">
        {children || <Outlet />}
      </main>
      <ChatBot />
    </div>
  );
};

export default Layout;
