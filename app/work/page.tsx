'use client'

import React from 'react';
import { Button } from '../../components/Login/ui/button';

export default function SimplePage() {
  const handleClick = () => {
    alert('Button clicked!');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-8">Simple Page with Button</h1>
      <Button 
        onClick={handleClick}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Click Me!
      </Button>
    </div>
  );
}