"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Abstraxion, useAbstraxionAccount, useModal } from "@burnt-labs/abstraxion";
import { Button } from "@burnt-labs/ui";
import { FaUser, FaCompass, FaHome, FaEllipsisH } from "react-icons/fa";

const Navbar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { data: account } = useAbstraxionAccount();
  const [, setShowModal] = useModal();
  const [profileData, setProfileData] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Function to handle wallet connection
  const handleConnect = () => {
    setShowModal(true);
  };

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Check if a link is active
  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname?.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className="bg-[#0a0e17] border-b border-[#1d293e] py-4 px-6 sticky top-0 z-50 backdrop-blur-md bg-opacity-90">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Link href="/" className="text-white font-bold text-xl flex items-center">
            <div className="mr-3 bg-indigo-600 text-white p-2 rounded-xl rotate-3 transform hover:rotate-6 transition-all duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </Link>
        </div>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-1">
          <Link 
            href="/" 
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
              isActive('/') 
                ? 'bg-indigo-500/20 text-indigo-400' 
                : 'text-gray-400 hover:text-white hover:bg-[#1d293e]'
            } flex items-center`}
          >
            <FaHome className="mr-2" />
            <span>Home</span>
          </Link>
          
          <Link 
            href="/discover" 
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
              isActive('/discover') 
                ? 'bg-indigo-500/20 text-indigo-400' 
                : 'text-gray-400 hover:text-white hover:bg-[#1d293e]'
            } flex items-center`}
          >
            <FaCompass className="mr-2" />
            <span>Discover</span>
          </Link>
          
          {account?.bech32Address ? (
            <Link 
              href="/profile" 
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                isActive('/profile') 
                  ? 'bg-indigo-500/20 text-indigo-400' 
                  : 'text-gray-400 hover:text-white hover:bg-[#1d293e]'
              } flex items-center`}
            >
              <FaUser className="mr-2" />
              <span>My Profile</span>
            </Link>
          ) : null}

          {account?.bech32Address ? (
            <div className="flex items-center space-x-2 ml-2">
              <div className="px-4 py-1 bg-[#131929] rounded-full border border-[#1d293e] text-xs text-gray-300">
                {account.bech32Address.substring(0, 6)}...{account.bech32Address.substring(account.bech32Address.length - 4)}
              </div>
            </div>
          ) : (
            <button 
              onClick={handleConnect}
              className="group relative overflow-hidden rounded-full bg-indigo-600 px-5 py-2 text-white transition-all hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-600/20 active:scale-95"
            >
              <span className="absolute top-0 left-0 h-full w-full bg-white/20 translate-y-full transform transition-transform duration-300 group-hover:translate-y-0"></span>
              <span className="relative z-10 font-medium">Connect</span>
            </button>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden">
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-gray-400 hover:text-white focus:outline-none"
          >
            <FaEllipsisH className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-4 bg-[#131929] rounded-xl border border-[#1d293e] p-2 overflow-hidden animate-fade-in-down">
          <Link 
            href="/" 
            className={`block px-4 py-2 rounded-lg text-sm font-medium mb-1 ${
              isActive('/') 
                ? 'bg-indigo-500/20 text-indigo-400' 
                : 'text-gray-400 hover:text-white hover:bg-[#0d121f]'
            } flex items-center`}
          >
            <FaHome className="mr-2" />
            <span>Home</span>
          </Link>
          
          <Link 
            href="/discover" 
            className={`block px-4 py-2 rounded-lg text-sm font-medium mb-1 ${
              isActive('/discover') 
                ? 'bg-indigo-500/20 text-indigo-400' 
                : 'text-gray-400 hover:text-white hover:bg-[#0d121f]'
            } flex items-center`}
          >
            <FaCompass className="mr-2" />
            <span>Discover</span>
          </Link>
          
          {account?.bech32Address ? (
            <Link 
              href="/profile" 
              className={`block px-4 py-2 rounded-lg text-sm font-medium mb-1 ${
                isActive('/profile') 
                  ? 'bg-indigo-500/20 text-indigo-400' 
                  : 'text-gray-400 hover:text-white hover:bg-[#0d121f]'
              } flex items-center`}
            >
              <FaUser className="mr-2" />
              <span>My Profile</span>
            </Link>
          ) : (
            <button 
              onClick={handleConnect}
              className="w-full text-left px-4 py-2 rounded-lg text-sm font-medium mb-1 bg-indigo-600 text-white hover:bg-indigo-700 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Connect</span>
            </button>
          )}
        </div>
      )}
      
      {/* Abstraxion modal */}
      <Abstraxion onClose={() => setShowModal(false)} />
    </nav>
  );
};

export default Navbar; 