import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FiHome, 
  FiBarChart2, 
  FiAlertTriangle, 
  FiMail, 
  FiBell,
  FiMenu,
  FiX,
  FiZap,
  FiUser,
  FiSettings
} from 'react-icons/fi';

const Navigation = ({ notifications = [] }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: FiHome },
    { name: 'Analytics', href: '/analytics', icon: FiBarChart2 },
    { name: 'Alerts', href: '/alerts', icon: FiAlertTriangle },
    { name: 'Contact', href: '/contact', icon: FiMail },
  ];

  const unreadNotifications = notifications.filter(n => !n.read);

  // Demo notifications data
  const demoNotifications = [
   
  
  ];

  const displayNotifications = notifications.length > 0 ? notifications : demoNotifications;

  return (
    <nav className="bg-white shadow-lg border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and main navigation */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3">
              {/* <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg">
                <FiZap className="w-6 h-6 text-white" />
              </div> */}
              <div className="flex flex-row items-center gap-4 ">
                <span className="text-2xl font-bold text-gray-900">Umeme⚡AI</span>
                <span className="text-xs text-gray-500 hidden md:block">Smart Grids for a Brighter Kenya</span>
              </div>
            </Link>
            
            {/* Desktop navigation */}
            <div className="hidden md:ml-8 md:flex md:space-x-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-green-50 to-blue-50 text-green-700 border border-green-200 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.name}
                    {isActive && (
                      <div className="ml-2 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right side - Notifications and user menu */}
          <div className="flex items-center space-x-4">
            {/* Live Status Indicator */}
            <div className="hidden md:flex items-center space-x-2 bg-green-50 px-3 py-2 rounded-lg border border-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-green-700">System Live</span>
            </div>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsNotificationsOpen(!isNotificationsOpen);
                  setIsProfileMenuOpen(false);
                }}
                className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <FiBell className="w-5 h-5" />
                {unreadNotifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                    {unreadNotifications.length}
                  </span>
                )}
              </button>

              {/* Notifications dropdown */}
              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        {displayNotifications.length} unread
                      </span>
                    </div>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {displayNotifications.length > 0 ? (
                      displayNotifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer ${
                            !notification.read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                          }`}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <p className={`text-sm font-medium ${
                              notification.type === 'warning' ? 'text-orange-700' : 'text-gray-900'
                            }`}>
                              {notification.title}
                            </p>
                            <span className="text-xs text-gray-400">
                              {new Date(notification.timestamp).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            {notification.message}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-8 text-center">
                        <FiBell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-sm text-gray-500">No notifications</p>
                        <p className="text-xs text-gray-400 mt-1">All systems are running smoothly</p>
                      </div>
                    )}
                  </div>
                  <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 rounded-b-xl">
                    <div className="flex justify-between">
                      <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                        Mark all as read
                      </button>
                      <button className="text-sm text-gray-600 hover:text-gray-700">
                        View all
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* User profile menu */}
            {/* <div className="relative">
              <button
                onClick={() => {
                  setIsProfileMenuOpen(!isProfileMenuOpen);
                  setIsNotificationsOpen(false);
                }}
                className="flex items-center space-x-2 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                  <FiUser className="w-4 h-4 text-white" />
                </div>
                <span className="hidden md:block text-sm font-medium">Admin</span>
              </button> */}

              {/* Profile dropdown */}
              {/* {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">Administrator</p>
                    <p className="text-sm text-gray-500">admin@umemeai.co.ke</p>
                  </div>
                  <div className="py-2">
                    <Link
                      to="/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <FiUser className="w-4 h-4 mr-3" />
                      Your Profile
                    </Link>
                    <Link
                      to="/settings"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <FiSettings className="w-4 h-4 mr-3" />
                      Settings
                    </Link>
                  </div>
                  <div className="border-t border-gray-100 pt-2">
                    <button className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                      <FiX className="w-4 h-4 mr-3" />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div> */}

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {isMobileMenuOpen ? (
                  <FiX className="w-5 h-5" />
                ) : (
                  <FiMenu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4 bg-white">
            <div className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center px-4 py-3 text-base font-medium rounded-lg transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-green-50 to-blue-50 text-green-700 border border-green-200'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {item.name}
                    {isActive && (
                      <div className="ml-auto w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    )}
                  </Link>
                );
              })}
            </div>
            
            {/* Mobile status indicator */}
            <div className="mt-4 px-4 py-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-700">System Live</span>
              </div>
              <p className="text-xs text-green-600 mt-1">All systems operational</p>
            </div>
          </div>
        )}
      </div>

      {/* Overlay for dropdowns */}
      {(isNotificationsOpen || isProfileMenuOpen || isMobileMenuOpen) && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-10"
          onClick={() => {
            setIsNotificationsOpen(false);
            setIsProfileMenuOpen(false);
            setIsMobileMenuOpen(false);
          }}
        ></div>
      )}
    </nav>
  );
};

export default Navigation;