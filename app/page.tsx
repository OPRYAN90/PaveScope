'use client'

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Menu, X } from 'lucide-react';
import { Button } from "@/components/HomePage/ui/button";
import { DroneAnimation } from "@/components/HomePage/DroneAnimation";
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleScroll = () => setScrollY(window.scrollY);
      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    }
  }, []);

  const handleLogin = () => router.push('/signin');
  const handleSignUp = () => router.push('/signup');

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-100 to-white relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <DroneAnimation />
      </div>
      
      <header className={`relative z-10 transition-all duration-300 ${scrollY > 50 ? "bg-white bg-opacity-90 shadow-lg" : "bg-transparent"}`}>
        <nav className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <motion.div 
              className="flex items-center"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Link href="/">
                <div style={{ position: 'relative', width: '50px', height: '50px' }}>
                  <Image 
                    src="/images/logo.png" 
                    alt="PaveScope Logo" 
                    layout="fill"
                    objectFit="contain"
                    style={{ position: 'absolute', top: '2px', left: '13px' }}
                  />
                </div>
              </Link>
              <span className="text-2xl font-bold text-blue-600 ml-2">PaveScope</span>
            </motion.div>
            <div className="hidden md:flex space-x-4">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Button 
                  variant="outline" 
                  onClick={handleLogin}
                  className="text-blue-600 border-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-300 ease-in-out transform hover:scale-105 rounded-full px-6 py-2"
                >
                  Log In
                </Button>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Button 
                  onClick={handleSignUp}
                  className="bg-blue-600 text-white hover:bg-blue-700 transition-all duration-300 ease-in-out transform hover:scale-105 rounded-full px-6 py-2 shadow-md"
                >
                  Sign Up
                </Button>
              </motion.div>
            </div>
            <div className="md:hidden">
              <Button variant="ghost" onClick={toggleMenu} className="text-blue-600 hover:text-blue-800">
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </Button>
            </div>
          </div>
        </nav>
      </header>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            className="fixed inset-0 bg-blue-600 z-40 flex flex-col justify-center items-center"
            initial={{ opacity: 0, y: "-100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "-100%" }}
            transition={{ duration: 0.3 }}
          >
            <Button variant="ghost" onClick={toggleMenu} className="absolute top-4 right-4 text-white">
              <X size={24} />
            </Button>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Button variant="ghost" className="text-white text-2xl my-2" onClick={() => { handleLogin(); toggleMenu(); }}>
                Log In
              </Button>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Button variant="ghost" className="text-white text-2xl my-2" onClick={() => { handleSignUp(); toggleMenu(); }}>
                Sign Up
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-grow flex items-center justify-center px-4 relative z-10">
        <div className="max-w-4xl w-full space-y-12 text-center">
          <motion.h1 
            className="text-6xl font-bold text-blue-800"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            Revolutionizing Road Analysis
          </motion.h1>
          <motion.p 
            className="text-2xl text-blue-600"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            PaveScope uses advanced drone technology and AI to analyze road conditions, 
            detecting potholes, cracks, and other surface defects with high precision.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="flex justify-center"
          >
            <Button 
              onClick={handleSignUp}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full text-xl font-semibold transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg flex items-center justify-center"
            >
              Start Your Analysis <ArrowRight className="ml-2 h-6 w-6" />
            </Button>
          </motion.div>
        </div>
      </main>

      <footer className="bg-blue-800 text-white py-8">
        <div className="container mx-auto px-6 text-center">
          <p>&copy; 2024 PaveScope. All rights reserved.</p>
          <div className="mt-4 flex justify-center space-x-4">
            {['Privacy Policy', 'Terms of Service', 'Contact Us'].map((item) => (
              <Link key={item} href="#" className="hover:underline">
                {item}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
