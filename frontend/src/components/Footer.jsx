import React from 'react';
import { FiMail, FiPhone, FiMapPin, FiTwitter, FiLinkedin, FiGithub, FiZap } from 'react-icons/fi';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg flex items-center justify-center mr-3">
                <FiZap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Umeme⚡AI</h3>
            </div>
            <p className="text-gray-600 mb-4 leading-relaxed">
              Advanced AI-powered energy management solutions for sustainable development. 
              We provide intelligent grid optimization, real-time monitoring, and predictive 
              analytics for utilities and energy companies worldwide.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-green-600 transition-colors">
                <FiTwitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-green-600 transition-colors">
                <FiLinkedin className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-green-600 transition-colors">
                <FiGithub className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="/" className="text-gray-600 hover:text-green-600 transition-colors">Dashboard</a></li>
              <li><a href="/analytics" className="text-gray-600 hover:text-green-600 transition-colors">Analytics</a></li>
              <li><a href="/alerts" className="text-gray-600 hover:text-green-600 transition-colors">Alerts</a></li>
              <li><a href="/contact" className="text-gray-600 hover:text-green-600 transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Contact Us</h4>
            <div className="space-y-3">
              <div className="flex items-center text-gray-600">
                <FiMapPin className="w-4 h-4 mr-3 text-green-500" />
                <span>Nairobi, Kenya</span>
              </div>
              <div className="flex items-center text-gray-600">
                <FiPhone className="w-4 h-4 mr-3 text-green-500" />
                <span>+254 700 000 000</span>
              </div>
              <div className="flex items-center text-gray-600">
                <FiMail className="w-4 h-4 mr-3 text-green-500" />
                <span>info@umemeai.co.ke</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-500 text-sm mb-4 md:mb-0">
              © 2024 Umeme AI. All rights reserved.
            </div>
            <div className="flex space-x-6 text-sm text-gray-500">
              <a href="#" className="hover:text-green-600 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-green-600 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-green-600 transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;