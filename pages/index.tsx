import React from 'react';
import Navbar from "../components/HomePage/Navbar";
import MainContent from "../components/HomePage/MainContent";
import AutomationCard from "../components/HomePage/AutomationCard";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="flex flex-col lg:flex-row justify-between max-w-7xl mx-auto mt-20 px-4">
        <MainContent />
        <div className="lg:w-1/2 mt-8 lg:mt-0">
          <AutomationCard />
        </div>
      </main>
    </div>
  );
}