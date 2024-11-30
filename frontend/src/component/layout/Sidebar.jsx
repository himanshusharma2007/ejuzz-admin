import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Dashboard, 
  AccountBalance, 
  Store, 
  ShoppingCart, 
  AttachMoney, 
  LocalShipping, 
  People, 
  Settings,
  ChevronRight,
  ChevronLeft ,
  Person,
  AdminPanelSettings
} from '@mui/icons-material';
import { Box, Tooltip } from '@mui/material';
import logo from '../../assets/images/ejuuzlogo.png';
const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const sidebarItems = [
    { label: 'Dashboard', icon: <Dashboard />, link: '/' },
    { label: 'Merchants', icon: <Store />, link: '/merchants' },
    { label: 'Users', icon: <People />, link: '/users' },
    { label: 'Shops', icon: <ShoppingCart />, link: '/shops' },
    { label: 'Transactions', icon: <AttachMoney />, link: '/transactions' },
    { label: 'Sub Admins', icon:<AdminPanelSettings />, link: '/sub-admins' },
    { label: 'Accounts', icon: <AccountBalance />, link: '/accounts' },
    { label: 'Profile', icon: <Person />, link: '/profile' },
    { label: 'Settings', icon: <Settings />, link: '/settings' }
  ];

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <Box
      component="nav"
      className={`
        bg-primary-color 
        h-full 
        shadow-xl 
        transition-all 
        duration-300 
        ease-in-out
        ${isCollapsed ? 'w-20' : 'w-72'}
        relative
        overflow-hidden
      `}
    >
      {/* Sidebar Toggle Button */}
      <button 
        onClick={toggleSidebar}
        className="
          absolute 
          top-4 
          right-4 
          z-10 
          text-white 
          hover:bg-primary-color/90 
          p-2 
          rounded-full 
          transition-colors
        "
      >
        {isCollapsed ? <ChevronRight /> : <ChevronLeft />}
      </button>

      {/* Logo or Brand Area */}
      <div 
        className={`
          flex 
          flex-col
          items-center 
          justify-center 
          h-20 
          border-b 
          border-white/10 
          transition-all 
          duration-300
          ${isCollapsed ? 'px-2' : 'px-6'}
        `}
      >
        <h2 
          className={`
            text-white 
            font-bold 
            transition-opacity 
            duration-300
            ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100 text-xl'}
          `}
        >
          Admin Panel
        </h2>
      </div>

      {/* Navigation Items */}
      <div className="py-4 px-2">
        <nav>
          {sidebarItems.map((item, index) => (
            <NavLink 
              key={index}
              to={item.link} 
              className={({ isActive }) => `
                flex 
                items-center 
                group 
                mb-2 
                rounded-lg 
                transition-all 
                duration-300
                ${isActive 
                  ? 'bg-white/20 text-white' 
                  : 'text-white/70 hover:bg-white/10 hover:text-white'}
                ${isCollapsed ? 'justify-center p-2' : 'p-3'}
              `}
            >
              {({ isActive }) => (
                <>
                  {isCollapsed ? (
                    <Tooltip title={item.label} placement="right">
                      <span className="flex items-center justify-center">
                        {React.cloneElement(item.icon, {
                          className: `
                            ${isActive ? 'text-white' : 'text-white/70'}
                            group-hover:text-white
                            transition-colors
                            duration-300
                          `
                        })}
                      </span>
                    </Tooltip>
                  ) : (
                    <>
                      {React.cloneElement(item.icon, {
                        className: `
                          mr-3 
                          ${isActive ? 'text-white' : 'text-white/70'}
                          group-hover:text-white
                          transition-colors
                          duration-300
                        `
                      })}
                      <span 
                        className={`
                          transition-opacity 
                          duration-300 
                          ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100'}
                        `}
                      >
                        {item.label}
                      </span>
                    </>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
    </Box>
  );
};

export default Sidebar;