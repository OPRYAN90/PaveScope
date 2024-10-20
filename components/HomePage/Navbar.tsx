'use client'
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import Link from "next/link"; // Next.js Link
import { useAuth } from '../AuthProvider';
import { signOutUser } from '../../lib/auth';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { user, loading } = useAuth();
  const router = useRouter();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOutUser();
      window.location.href = '/'; // Redirect to home page
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  const handleDashboardClick = () => {
    router.push('/dashboard');
  };

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-10 transition-all duration-300 ease-in-out ${
        scrolled ? "bg-white shadow-lg" : "bg-transparent"
      }`}
    >
      <div className="flex justify-between items-center p-4 max-w-7xl mx-auto">
        <div className="flex items-center space-x-2">
          <div
            className="mt-1 w-12 h-8 rounded-[40%] overflow-hidden cursor-pointer"
            onClick={scrollToTop}
          >
            <img
              src="/images/logo.png" // Public path reference
              alt="PaveScope Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <div
            onClick={scrollToTop}
            className="text-xl font-bold text-gray-800 cursor-pointer"
          >
            <span className="text-xl font-bold -ml-2">PaveScope</span>
          </div>
        </div>
        <div className="hidden md:flex space-x-9">
          <a href="#about" className="text-gray-600 hover:text-gray-900">
            About
          </a>
          <a href="#team" className="text-gray-600 hover:text-gray-900">
            Team
          </a>
          <a href="#purpose" className="text-gray-600 hover:text-gray-900">
            Purpose
          </a>
          <a
            href="#specification"
            className="text-gray-600 hover:text-gray-900"
          >
            Specification
          </a>
        </div>
        <div className="flex space-x-4">
          {loading ? (
            <span>Loading...</span>
          ) : user ? (
            <>
              <Button
                variant="outline"
                onClick={handleDashboardClick}
                className="px-4 py-2 text-white bg-blue-500 border border-blue-500 rounded-md shadow-sm transition-all duration-200 ease-in-out hover:bg-blue-600 hover:border-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Dashboard
              </Button>
              <Button
                variant="outline"
                onClick={handleSignOut}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm transition-all duration-200 ease-in-out hover:bg-gray-50 hover:border-gray-400 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Link href="/signin">
                <Button
                  variant="outline"
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm transition-all duration-200 ease-in-out hover:bg-gray-50 hover:border-gray-400 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Login
                </Button>
              </Link>
              <Link href="/signup">
                <Button
                  variant="outline"
                  className="px-4 py-2 text-white bg-blue-500 border border-blue-500 rounded-md shadow-sm transition-all duration-200 ease-in-out hover:bg-blue-600 hover:border-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
