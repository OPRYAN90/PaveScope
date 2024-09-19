import React from "react";
import { Button } from "./ui/button";
import CompanyLogos from "./CompanyLogos";
import Link from 'next/link'; // Import Next.js Link

export default function MainContent() {
  return (
    <div className="lg:w-1/2 pr-8">
      <h1 className="text-5xl font-bold mb-4">Infrastructure Details</h1>
      <h2 className="text-4xl font-bold text-blue-600 mb-6">Saving Costs</h2>
      <p className="text-xl mb-8">
        Understand the insights behind your infrastructure deficiencies. Get
        depth estimation, cost analysis, and 3D infrastructural mappings.
      </p>
      <div className="flex space-x-4 mb-8">
        {/* Use Next.js Link for navigation */}
        <Link href="/get-started">
          <Button
            size="lg"
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            Start Detecting
          </Button>
        </Link>
        <Button
          size="lg"
          variant="outline"
          className="text-blue-500 hover:border-gray-600"
        >
          Learn More
        </Button>
      </div>
      <p className="text-sm text-gray-600 mb-12">
        Start Analyzing Your Infrastructure Today -Free Forever- PaveScope is
        Free for Infrastructural Companies -Get Started for Details/Mapping-
      </p>
      <CompanyLogos />
    </div>
  );
}
