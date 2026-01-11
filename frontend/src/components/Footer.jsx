import React from 'react';
import { FiMail, FiZap } from 'react-icons/fi';

const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          {/* Logo & Tagline */}
          <div className="flex items-center space-x-2">
            <FiZap className="w-5 h-5 text-green-600" />
            <span className="text-lg font-bold text-gray-900">Umeme⚡AI</span>
            <span className="text-sm text-gray-500 hidden md:inline">• Smart Grids for Kenya</span>
          </div>

          {/* Contact */}
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <a href="mailto:info@umemeai.co.ke" className="flex items-center space-x-1 hover:text-green-600 transition-colors">
              <FiMail className="w-4 h-4" />
              <span>info@umemeai.co.ke</span>
            </a>
          </div>

          {/* Copyright */}
          <div className="text-sm text-gray-500">
            © 2024 Umeme AI
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;